import json
import os
import psycopg2
import psycopg2.extras


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}


def resp(status: int, data: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps(data, ensure_ascii=False),
    }


def handler(event: dict, context) -> dict:
    """
    Бизнес: CRUD-операции для управления фильмами в каталоге.
    GET / — список всех фильмов
    POST / — добавить фильм
    PUT /{id} — обновить фильм
    DELETE /{id} — удалить фильм
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    path = event.get('path', '/')
    parts = [p for p in path.strip('/').split('/') if p]
    movie_id = int(parts[-1]) if parts and parts[-1].isdigit() else None

    if method == 'GET':
        cur.execute(
            "SELECT id, title, year, genre, rating, duration, poster, actors, description, trailer_id, featured "
            "FROM movies ORDER BY id DESC"
        )
        rows = [dict(r) for r in cur.fetchall()]
        for r in rows:
            r['rating'] = float(r['rating'])
            r['trailerId'] = r.pop('trailer_id')
        cur.close(); conn.close()
        return resp(200, {'movies': rows})

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        cur.execute(
            "INSERT INTO movies (title, year, genre, rating, duration, poster, actors, description, trailer_id, featured) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
            (
                body.get('title', ''), int(body.get('year', 2024)),
                body.get('genre', ''), float(body.get('rating', 0)),
                body.get('duration', ''), body.get('poster', ''),
                body.get('actors', []), body.get('description', ''),
                body.get('trailerId', ''), bool(body.get('featured', False)),
            )
        )
        new_id = cur.fetchone()['id']
        cur.close(); conn.close()
        return resp(201, {'id': new_id, 'ok': True})

    if method == 'PUT' and movie_id:
        cur.execute(
            "UPDATE movies SET title=%s, year=%s, genre=%s, rating=%s, duration=%s, poster=%s, "
            "actors=%s, description=%s, trailer_id=%s, featured=%s WHERE id=%s",
            (
                body.get('title', ''), int(body.get('year', 2024)),
                body.get('genre', ''), float(body.get('rating', 0)),
                body.get('duration', ''), body.get('poster', ''),
                body.get('actors', []), body.get('description', ''),
                body.get('trailerId', ''), bool(body.get('featured', False)),
                movie_id,
            )
        )
        cur.close(); conn.close()
        return resp(200, {'ok': True})

    if method == 'DELETE' and movie_id:
        cur.execute("DELETE FROM movies WHERE id=%s", (movie_id,))
        cur.close(); conn.close()
        return resp(200, {'ok': True})

    cur.close(); conn.close()
    return resp(400, {'error': 'Bad request'})
