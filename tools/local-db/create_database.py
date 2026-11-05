#!/usr/bin/env python3
"""Import the JM API Vault JSON catalogues into a local SQLite database.

Uses only Python's standard library. No Render, Docker, cloud database or paid service.
"""
from __future__ import annotations

import argparse
import json
import sqlite3
from pathlib import Path
from datetime import datetime, timezone


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def records(document, key):
    if not isinstance(document, dict) or key not in document or not isinstance(document[key], list):
        raise ValueError(f"Catalogue must contain an explicit '{key}' array")
    seen = set()
    for item in document[key]:
        if not isinstance(item, dict) or not isinstance(item.get('id'), str) or not item['id'].strip():
            raise ValueError(f"{key}: every record must have a non-empty string id")
        if item['id'] in seen:
            raise ValueError(f"{key}: duplicate record id")
        seen.add(item['id'])
    return document[key]


def ensure_schema(db: sqlite3.Connection):
    db.executescript("""
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS knowledge_entries (
        id TEXT PRIMARY KEY,
        category TEXT,
        status TEXT,
        title TEXT NOT NULL,
        tags_json TEXT NOT NULL DEFAULT '[]',
        summary TEXT,
        url TEXT,
        source_json TEXT NOT NULL,
        imported_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_entries(category);
    CREATE INDEX IF NOT EXISTS idx_knowledge_status ON knowledge_entries(status);
    CREATE INDEX IF NOT EXISTS idx_knowledge_title ON knowledge_entries(title);

    CREATE TABLE IF NOT EXISTS research_sources (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        platform TEXT,
        status TEXT,
        quality TEXT,
        url TEXT,
        topics_json TEXT NOT NULL DEFAULT '[]',
        evidence TEXT,
        notes TEXT,
        source_json TEXT NOT NULL,
        imported_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sources_platform ON research_sources(platform);
    CREATE INDEX IF NOT EXISTS idx_sources_status ON research_sources(status);
    CREATE INDEX IF NOT EXISTS idx_sources_name ON research_sources(name);

    CREATE TABLE IF NOT EXISTS import_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dataset TEXT NOT NULL,
        source_file TEXT NOT NULL,
        record_count INTEGER NOT NULL,
        imported_at TEXT NOT NULL
    );
    """)


def import_knowledge(db, path: Path, imported_at: str) -> int:
    document = load_json(path)
    entries = records(document, "entries")
    db.execute("DELETE FROM knowledge_entries")
    db.executemany("""
        INSERT INTO knowledge_entries
        (id, category, status, title, tags_json, summary, url, source_json, imported_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, [
        (
            str(e["id"]), e.get("category"), e.get("status"),
            str(e.get("title") or e["id"]),
            json.dumps(e.get("tags", []), ensure_ascii=False),
            e.get("summary"), e.get("url"),
            json.dumps(e, ensure_ascii=False), imported_at
        )
        for e in entries
    ])
    db.execute(
        "INSERT INTO import_history(dataset,source_file,record_count,imported_at) VALUES(?,?,?,?)",
        ("knowledge", str(path), len(entries), imported_at)
    )
    return len(entries)


def import_sources(db, path: Path, imported_at: str) -> int:
    document = load_json(path)
    sources = records(document, "sources")
    db.execute("DELETE FROM research_sources")
    db.executemany("""
        INSERT INTO research_sources
        (id, name, platform, status, quality, url, topics_json, evidence, notes, source_json, imported_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, [
        (
            str(s["id"]), str(s.get("name") or s["id"]),
            s.get("platform"), s.get("status"), s.get("quality"),
            s.get("url"), json.dumps(s.get("topics", []), ensure_ascii=False),
            s.get("evidence"), s.get("notes"),
            json.dumps(s, ensure_ascii=False), imported_at
        )
        for s in sources
    ])
    db.execute(
        "INSERT INTO import_history(dataset,source_file,record_count,imported_at) VALUES(?,?,?,?)",
        ("research_sources", str(path), len(sources), imported_at)
    )
    return len(sources)


def main():
    parser = argparse.ArgumentParser(description="Criar/atualizar a base de dados local JM Vault.")
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[2],
                        help="Pasta raiz do repositório Git (por defeito, detetada automaticamente).")
    parser.add_argument("--db", type=Path, default=None,
                        help="Ficheiro SQLite de destino (por defeito: api-vault/data/jm-vault.sqlite3).")
    parser.add_argument("--knowledge", type=Path, default=None)
    parser.add_argument("--catalog", type=Path, default=None)
    args = parser.parse_args()

    root = args.repo_root.resolve()
    knowledge = (args.knowledge or root / "api-vault" / "knowledge.json").resolve()
    catalog = (args.catalog or root / "research" / "catalog" / "sources.json").resolve()
    database = (args.db or root / "api-vault" / "data" / "jm-vault.sqlite3").resolve()

    for source in (knowledge, catalog):
        if not source.is_file():
            raise SystemExit(f"Ficheiro de origem não encontrado: {source}")

    database.parent.mkdir(parents=True, exist_ok=True)
    imported_at = datetime.now(timezone.utc).isoformat()
    with sqlite3.connect(database) as db:
        ensure_schema(db)
        db.execute("BEGIN")
        knowledge_count = import_knowledge(db, knowledge, imported_at)
        source_count = import_sources(db, catalog, imported_at)
        integrity = db.execute("PRAGMA integrity_check").fetchone()[0]
        if integrity != "ok":
            raise RuntimeError(f"SQLite integrity check failed: {integrity}")

    print("Base de dados JM Vault criada/atualizada.")
    print(f"Ficheiro: {database}")
    print(f"Entradas de conhecimento: {knowledge_count}")
    print(f"Fontes de investigação: {source_count}")
    print(f"Integridade SQLite: {integrity}")
    print("Importação limitada aos catálogos indicados; não foram lidas variáveis de ambiente.")


if __name__ == "__main__":
    main()
