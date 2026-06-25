import json
import os
import psycopg2
import psycopg2.extras


def handler(event: dict, context) -> dict:
    '''
    Business: Возвращает список фильмов с поиском по названию/жанру/актёрам и фильтрами по жанру и рейтингу.
    Args: event с httpMethod, queryStringParameters (q, genre, min_rating)
    Returns: HTTP-ответ со списком фильмов и фильмом недели
    '''
    method = event.get('httpMethod', 'GET')

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    params = event.get('queryStringParameters') or {}
    q = (params.get('q') or '').strip().lower()
    genre = (params.get('genre') or '').strip()
    try:
        min_rating = float(params.get('min_rating') or 0)
    except ValueError:
        min_rating = 0.0

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    clauses = ['rating >= %s']
    values = [min_rating]

    if genre and genre != 'Все':
        clauses.append('genre = %s')
        values.append(genre)

    if q:
        clauses.append("(LOWER(title) LIKE %s OR LOWER(genre) LIKE %s OR EXISTS (SELECT 1 FROM unnest(actors) a WHERE LOWER(a) LIKE %s))")
        like = f'%{q}%'
        values.extend([like, like, like])

    where = ' AND '.join(clauses)
    cur.execute(f"SELECT id, title, year, genre, rating, duration, poster, actors, description, trailer_id, featured FROM movies WHERE {where} ORDER BY rating DESC", values)
    rows = cur.fetchall()

    cur.execute("SELECT id, title, year, genre, rating, duration, poster, actors, description, trailer_id FROM movies WHERE featured = TRUE LIMIT 1")
    featured = cur.fetchone()

    cur.execute("SELECT DISTINCT genre FROM movies ORDER BY genre")
    genres = [r['genre'] for r in cur.fetchall()]

    cur.close()
    conn.close()

    def fmt(m):
        m = dict(m)
        m['rating'] = float(m['rating'])
        m['trailerId'] = m.pop('trailer_id')
        return m

    body = {
        'movies': [fmt(r) for r in rows],
        'featured': fmt(featured) if featured else None,
        'genres': ['Все'] + genres,
    }

    return {
        'statusCode': 200,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps(body, ensure_ascii=False),
    }
