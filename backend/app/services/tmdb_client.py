import httpx
from app.core.config import settings

TMDB_BASE_URL = "https://api.themoviedb.org/3"

async def search_movies(query: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_BASE_URL}/search/movie",
            params={"api_key": settings.tmdb_api_key, "query": query}
        )
        response.raise_for_status()
        data = response.json()

    results = []
    for movie in data.get("results", []):
        release_date = movie.get("release_date") or ""
        year = int(release_date[:4]) if release_date[:4].isdigit() else None
        results.append({
            "tmdb_id": movie["id"],
            "title": movie["title"],
            "release_year": year,
            "poster_path": movie.get("poster_path"),
            "overview": movie.get("overview"),
        })
    return results


async def get_movie_details(tmdb_id: int):
    async with httpx.AsyncClient() as client:
        movie_resp = await client.get(
            f"{TMDB_BASE_URL}/movie/{tmdb_id}",
            params={"api_key": settings.tmdb_api_key}
        )
        movie_resp.raise_for_status()
        movie_data = movie_resp.json()

        credits_resp = await client.get(
            f"{TMDB_BASE_URL}/movie/{tmdb_id}/credits",
            params={"api_key": settings.tmdb_api_key}
        )
        credits_resp.raise_for_status()
        credits_data = credits_resp.json()

    release_date = movie_data.get("release_date") or ""
    year = int(release_date[:4]) if release_date[:4].isdigit() else None

    genres = [g["name"] for g in movie_data.get("genres", [])]

    cast = [
        {"tmdb_person_id": c["id"], "name": c["name"], "profile_path": c.get("profile_path"), "character_name": c.get("character")}
        for c in credits_data.get("cast", [])[:10]
    ]

    directors = [
        {"tmdb_person_id": c["id"], "name": c["name"], "profile_path": c.get("profile_path")}
        for c in credits_data.get("crew", []) if c.get("job") == "Director"
    ]

    return {
        "tmdb_id": movie_data["id"],
        "title": movie_data["title"],
        "release_year": year,
        "poster_path": movie_data.get("poster_path"),
        "overview": movie_data.get("overview"),
        "genres": genres,
        "cast": cast,
        "directors": directors,
    }


async def search_tv_shows(query: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_BASE_URL}/search/tv",
            params={"api_key": settings.tmdb_api_key, "query": query}
        )
        response.raise_for_status()
        data = response.json()

    results = []
    for show in data.get("results", []):
        first_air_date = show.get("first_air_date") or ""
        year = int(first_air_date[:4]) if first_air_date[:4].isdigit() else None
        results.append({
            "tmdb_id": show["id"],
            "title": show["name"],
            "first_air_year": year,
            "poster_path": show.get("poster_path"),
            "overview": show.get("overview"),
        })
    return results


async def get_show_details(tmdb_id: int):
    async with httpx.AsyncClient() as client:
        show_resp = await client.get(
            f"{TMDB_BASE_URL}/tv/{tmdb_id}",
            params={"api_key": settings.tmdb_api_key}
        )
        show_resp.raise_for_status()
        show_data = show_resp.json()

        credits_resp = await client.get(
            f"{TMDB_BASE_URL}/tv/{tmdb_id}/credits",
            params={"api_key": settings.tmdb_api_key}
        )
        credits_resp.raise_for_status()
        credits_data = credits_resp.json()

    first_air_date = show_data.get("first_air_date") or ""
    year = int(first_air_date[:4]) if first_air_date[:4].isdigit() else None

    genres = [g["name"] for g in show_data.get("genres", [])]

    cast = [
        {"tmdb_person_id": c["id"], "name": c["name"], "profile_path": c.get("profile_path"), "character_name": c.get("character")}
        for c in credits_data.get("cast", [])[:10]
    ]

    return {
        "tmdb_id": show_data["id"],
        "title": show_data["name"],
        "first_air_year": year,
        "poster_path": show_data.get("poster_path"),
        "overview": show_data.get("overview"),
        "number_of_seasons": show_data.get("number_of_seasons"),
        "number_of_episodes": show_data.get("number_of_episodes"),
        "genres": genres,
        "cast": cast,
    }


async def get_backdrop_movies():
    import random
    random_page = random.randint(1, 19)

    results = []
    seen_ids = set()
    async with httpx.AsyncClient() as client:
        for page in (random_page, random_page + 1):
            response = await client.get(
                f"{TMDB_BASE_URL}/discover/movie",
                params={
                    "api_key": settings.tmdb_api_key,
                    "page": page,
                    "include_adult": "false",
                    "with_origin_country": "US",
                    "sort_by": "popularity.desc",
                }
            )
            response.raise_for_status()
            data = response.json()

            for movie in data.get("results", []):
                if movie.get("poster_path") and movie["id"] not in seen_ids and not movie.get("adult", False):
                    seen_ids.add(movie["id"])
                    results.append({
                        "tmdb_id": movie["id"],
                        "title": movie["title"],
                        "poster_path": movie["poster_path"],
                    })

    return results