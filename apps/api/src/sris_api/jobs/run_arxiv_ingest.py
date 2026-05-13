import asyncio
import os

import httpx


async def main() -> None:
    base_url = os.environ["API_BASE_URL"].rstrip("/")
    if "://" not in base_url:
        base_url = f"https://{base_url}"
    cron_secret = os.environ["CRON_SECRET"]
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{base_url}/ingest/arxiv/run",
            headers={"x-cron-secret": cron_secret},
        )
        response.raise_for_status()
        print(response.json())


if __name__ == "__main__":
    asyncio.run(main())
