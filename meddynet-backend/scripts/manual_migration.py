# Standalone migration script to sync NeonDB schema via host-mapped port 5433
import sqlalchemy as sa
from sqlalchemy import create_engine, text

# Host-mapped Postgres URL (NeonDB emulator in Docker)
DATABASE_URL = "postgresql://admin:password@127.0.0.1:5433/meddynet"


def migrate():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Connected to NeonDB. Starting architectural re-alignment...")

        # 1. Add image_url fields
        try:
            conn.execute(
                text("ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(500);")
            )
            print("Added profile_image_url to users")
        except Exception as e:
            print(f"Users image column: {e}")

        try:
            conn.execute(text("ALTER TABLE labs ADD COLUMN image_url VARCHAR(500);"))
            print("Added image_url to labs")
        except Exception as e:
            print(f"Labs image column: {e}")

        try:
            conn.execute(
                text(
                    "ALTER TABLE technicians ADD COLUMN profile_image_url VARCHAR(500);"
                )
            )
            print("Added profile_image_url to technicians")
        except Exception as e:
            print(f"Technicians image column: {e}")

        # 2. Migration: Move Notifications to NoSQL
        try:
            conn.execute(text("DROP TABLE IF EXISTS notifications;"))
            print("Dropped notifications table (moving to MongoDB)")
        except Exception as e:
            print(f"Drop Table: {e}")

        conn.commit()
        print("Migration Complete.")


if __name__ == "__main__":
    migrate()
