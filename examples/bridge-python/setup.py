from setuptools import setup, find_packages

setup(
    name="sarak-ui-core",
    version="1.0.0",
    description="Backend Soberano para GestÃ£o de Interface e Design Sarak Matrix",
    author="Igor Sarak",
    packages=find_packages(where="backend"),
    package_dir={"": "backend"},
    python_requires=">=3.10",
    install_requires=[
        "fastapi",
        "sqlalchemy",
        "psycopg2-binary",
        "pydantic",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "httpx"
    ],
)
