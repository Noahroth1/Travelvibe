import json
from pathlib import Path

from app.data.destinations import DESTINATIONS


METADATA_PATH = Path(__file__).parent / "destination_metadata.json"


def load_destination_metadata() -> dict[str, dict]:
    with METADATA_PATH.open(encoding="utf-8") as metadata_file:
        return json.load(metadata_file)


def build_destination_records() -> list[dict]:
    metadata_by_name = load_destination_metadata()
    records = []

    for destination_data in DESTINATIONS:
        metadata = metadata_by_name.get(destination_data["name"], {})
        tips_by_neighbourhood = metadata.get("neighbourhood_tips", {})
        neighbourhoods = [
            {
                **neighbourhood,
                "tips": tips_by_neighbourhood.get(neighbourhood["name"], []),
            }
            for neighbourhood in destination_data.get("neighbourhoods", [])
        ]

        records.append(
            {
                **destination_data,
                "best_time": metadata.get("best_time"),
                "visit_duration": metadata.get("visit_duration"),
                "budget_level": metadata.get("budget_level"),
                "vibes": metadata.get("vibes", []),
                "gallery": destination_data.get("gallery", []),
                "neighbourhoods": neighbourhoods,
            }
        )

    return records
