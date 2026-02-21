from .db import engine, Base

# Ensure models are imported so they register with SQLAlchemy's metadata
from . import models  # noqa: F401

from sqlalchemy import inspect, text, String, Integer, DateTime, Numeric


def _column_sql_type(col):
    t = col.type
    # map common SQLAlchemy types to simple SQL type names for ALTER TABLE
    if isinstance(t, String):
        return f"VARCHAR({t.length})" if getattr(t, "length", None) else "TEXT"
    if isinstance(t, Integer):
        return "INTEGER"
    if isinstance(t, DateTime):
        return "DATETIME"
    if isinstance(t, Numeric):
        return "NUMERIC"
    # JSON and other types -> store as TEXT for SQLite compatibility
    return "TEXT"


def init_db():
    # Create any missing tables first
    Base.metadata.create_all(bind=engine)

    # Then inspect tables and add any missing columns (simple, best-effort)
    insp = inspect(engine)
    with engine.connect() as conn:
        for table in Base.metadata.sorted_tables:
            tname = table.name
            if not insp.has_table(tname):
                continue
            existing = [c["name"] for c in insp.get_columns(tname)]
            for col in table.columns:
                if col.name in existing:
                    continue
                sql_type = _column_sql_type(col)
                ddl = f'ALTER TABLE {tname} ADD COLUMN {col.name} {sql_type}'
                try:
                    conn.execute(text(ddl))
                except Exception:
                    # best-effort: ignore failures (e.g., unsupported types)
                    pass


if __name__ == "__main__":
    init_db()
    print("Database initialized/migrated")
