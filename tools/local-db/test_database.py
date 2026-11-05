import json
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name('create_database.py')

class ImportTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.k = self.root / 'knowledge.json'
        self.s = self.root / 'sources.json'
        self.db = self.root / 'test.sqlite3'
        self.write([{'id':'one','title':'Revisão TecDoc','tags':['peças']}], [{'id':'source','name':'Fonte'}])
        self.assertEqual(self.run_import().returncode, 0)
    def write(self, entries, sources):
        self.k.write_text(json.dumps({'entries':entries}))
        self.s.write_text(json.dumps({'sources':sources}))
    def run_import(self):
        return subprocess.run([sys.executable,str(SCRIPT),'--knowledge',str(self.k),'--catalog',str(self.s),'--db',str(self.db)],capture_output=True,text=True)
    def snapshot(self):
        with sqlite3.connect(self.db) as c:
            return [c.execute('SELECT * FROM '+t).fetchall() for t in ['knowledge_entries','research_sources','import_history']]
    def test_repeat_and_persistence(self):
        self.assertEqual(self.run_import().returncode,0)
        with sqlite3.connect(self.db) as c:
            self.assertEqual(c.execute('PRAGMA integrity_check').fetchone()[0],'ok')
            self.assertEqual(c.execute('SELECT count(*) FROM knowledge_entries').fetchone()[0],1)
            self.assertEqual(c.execute('SELECT count(*) FROM research_sources').fetchone()[0],1)
            self.assertEqual(c.execute('SELECT title FROM knowledge_entries WHERE title LIKE ?',('%TecDoc%',)).fetchone()[0],'Revisão TecDoc')
    def test_failed_second_catalog_rolls_back_first(self):
        before=self.snapshot()
        self.write([{'id':'changed','title':'Changed'}],[{'id':'duplicate'},{'id':'duplicate'}])
        self.assertNotEqual(self.run_import().returncode,0)
        self.assertEqual(self.snapshot(),before)
    def test_missing_collection_does_not_erase_data(self):
        before=self.snapshot()
        self.k.write_text('{}')
        self.assertNotEqual(self.run_import().returncode,0)
        self.assertEqual(self.snapshot(),before)
    def test_missing_sources_does_not_erase_data(self):
        before=self.snapshot()
        self.s.write_text('{}')
        self.assertNotEqual(self.run_import().returncode,0)
        self.assertEqual(self.snapshot(),before)
    def test_null_id_is_rejected(self):
        before=self.snapshot()
        self.write([{'id':None}], [{'id':'source'}])
        self.assertNotEqual(self.run_import().returncode,0)
        self.assertEqual(self.snapshot(),before)
    def test_unrelated_table_is_preserved(self):
        with sqlite3.connect(self.db) as c:
            c.execute('CREATE TABLE local_notes(note TEXT)')
            c.execute("INSERT INTO local_notes VALUES ('keep')")
        self.assertEqual(self.run_import().returncode,0)
        with sqlite3.connect(self.db) as c:
            self.assertEqual(c.execute('SELECT note FROM local_notes').fetchone()[0],'keep')

if __name__=='__main__': unittest.main()
