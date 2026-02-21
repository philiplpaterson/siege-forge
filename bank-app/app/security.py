import bcrypt


def hash_password(password: str) -> str:
    """Return bcrypt hash as utf-8 string for storage in DB."""
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def check_password(password: str, hashed: str) -> bool:
    """Accept stored hash as string and verify password."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
