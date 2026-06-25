CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    genre VARCHAR(100) NOT NULL,
    rating NUMERIC(3,1) NOT NULL DEFAULT 0,
    duration VARCHAR(50),
    poster TEXT,
    actors TEXT[] DEFAULT '{}',
    description TEXT,
    trailer_id VARCHAR(100),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO movies (title, year, genre, rating, duration, poster, actors, description, trailer_id, featured) VALUES
('Грань Горизонта', 2024, 'Фантастика', 8.7, '2ч 18м', 'https://cdn.poehali.dev/projects/aa5ca6f7-0c69-446a-9b81-2fde722e2a97/files/5e4e0ad6-a1b7-45cd-b8f2-e75559d69615.jpg', ARRAY['Алекс Райан','Мира Соул'], 'Космический инженер обнаруживает сигнал из глубин галактики, который меняет представление человечества о времени и пространстве.', 'aqz-KE-bpKQ', FALSE),
('Золотой Предел', 2023, 'Драма', 9.1, '2ч 41м', 'https://cdn.poehali.dev/projects/aa5ca6f7-0c69-446a-9b81-2fde722e2a97/files/a3364faa-0015-4554-b8fc-35033d788a36.jpg', ARRAY['Кай Лоренс','Нора Вэйн'], 'Эпическое путешествие на край мира, где герою предстоит сделать выбор между долгом и любовью.', 'd9MyW72ELq0', TRUE),
('Дождь над Городом', 2024, 'Триллер', 8.4, '1ч 56м', 'https://cdn.poehali.dev/projects/aa5ca6f7-0c69-446a-9b81-2fde722e2a97/files/5d763b43-1ca9-416c-80ca-6f8606025c53.jpg', ARRAY['Виктор Грэй','Лина Морс'], 'Детектив погружается в лабиринт ночного города, расследуя дело, которое связано с его собственным прошлым.', 'TcMBFSGVi1c', FALSE),
('Тёмная Орбита', 2022, 'Фантастика', 7.9, '2ч 05м', 'https://cdn.poehali.dev/projects/aa5ca6f7-0c69-446a-9b81-2fde722e2a97/files/5e4e0ad6-a1b7-45cd-b8f2-e75559d69615.jpg', ARRAY['Эван Сторм','Айя Ким'], 'Команда исследователей оказывается в ловушке на заброшенной орбитальной станции.', 'aqz-KE-bpKQ', FALSE),
('Последний Рассвет', 2023, 'Драма', 8.8, '2ч 12м', 'https://cdn.poehali.dev/projects/aa5ca6f7-0c69-446a-9b81-2fde722e2a97/files/a3364faa-0015-4554-b8fc-35033d788a36.jpg', ARRAY['Нора Вэйн','Том Эшфорд'], 'История семьи, переживающей перемены на фоне величественных пейзажей севера.', 'd9MyW72ELq0', FALSE),
('Неоновый Призрак', 2024, 'Триллер', 8.2, '1ч 49м', 'https://cdn.poehali.dev/projects/aa5ca6f7-0c69-446a-9b81-2fde722e2a97/files/5d763b43-1ca9-416c-80ca-6f8606025c53.jpg', ARRAY['Лина Морс','Дэн Хейл'], 'Хакер вступает в смертельную игру с корпорацией, контролирующей весь город.', 'TcMBFSGVi1c', FALSE);