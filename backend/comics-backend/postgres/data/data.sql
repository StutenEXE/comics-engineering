INSERT INTO series (added_by, "name", ongoing, oneshot, nvolumes, start_date, end_date) VALUES
    (1, 'Batman Metal', false, false, 3, '2017-08-01T00:00:00', '2018-05-01T00:00:00'),
    (1, 'Nightwing Infinite', false, false, 1,'2021-05-01T00:00:00', '2024-12-01T00:00:00');

INSERT INTO books (series_id, added_by, "name", "desc", "number", vo_content) VALUES
    (1, 1, 'La Forge', 'The first volume of Batman Metal', 1, 'Content of Batman Metal Volume 1'),
    (1, 1, 'Les Chevaliers Noirs', 'The second volume of Batman Metal', 2, 'Content of Batman Metal Volume 2'),
    (1, 1, 'Matière Hurlante', 'The third volume of Batman Metal', 3, 'Content of Batman Metal Volume 3'),
    (2, 1, 'Le Saut dans la Lumière', 'A special issue of Nightwing Infinite', 1, 'Content of Nightwing Infinite');

INSERT INTO publishers (name) VALUES('Urban Comics');

INSERT INTO editions (isbn, ean, npages, price, url, img_url, cover_type, parution_date, publisher_id, book_id, added_by) VALUES
    ('9791026813781', '9791026813781', 232, 22.5, 'https://www.urban-comics.com/batman-metal-tome-1/', 'https://bdi.dlpdomain.com/album/9791026813781/couv/M385x862/batman-metal-tome-1.jpg', 'Hardcover', '2018-05-25T00:00:00', 1, 1, 1),
    ('', '9791026813873', 248, 25.0, 'https://www.urban-comics.com/batman-metal-tome-2/', 'https://bdi.dlpdomain.com/album/9791026813873/couv/M385x862/batman-metal-tome-2.jpg', 'Hardcover', '2018-07-06T00:00:00', 1, 2, 1),
    ('', '9791026824107', 264, 25.0, 'https://www.urban-comics.com/batman-metal-tome-3/', 'https://bdi.dlpdomain.com/album/9791026824107/couv/M385x862/batman-metal-tome-3.jpg', 'Hardcover', '2018-11-02T00:00:00', 1, 3, 1),
    ('', '9791026819707', 160, 18.5, 'https://www.urban-comics.com/nightwing-infinite-tome-1/', 'https://bdi.dlpdomain.com/album/9791026819707/couv/M385x862/nightwing-infinite-tome-1.jpg', 'Hardcover', '2022-02-25T00:00:00', 1, 4, 1);

INSERT INTO issue_series(added_by, "name", "desc", start_date, end_date) VALUES
    (1, 'Dark Knights: Metal (Volume 1)', 'Dark Knights: Metal event monthly parution', '2017-10-01T00:00:00', '2018-05-01T00:00:00'),
    (1, 'Dark Days: The Forge', 'Dark Knights: Metal prequel and oneshot', '2017-08-01T00:00:00', '2017-08-01T00:00:00'),
    (1, 'Dark Days: The Casting', 'Dark Knights: Metal prequel and oneshot', '2017-09-01T00:00:00', '2017-09-01T00:00:00'),
    (1, 'Teen Titans (Volume 6)', 'Teen Titans serie from 2016', '2016-12-01T00:00:00', '2021-01-01T00:00:00'),
    (1, 'Nightwing (Volume 4)', 'Nightwing serie from 2016', '2016-09-01T00:00:00', null),
    (1, 'Suicide Squad (Volume 5)', 'Suicide Squad serie from 2016', '2016-10-01T00:00:00', '2019-03-01T00:00:00'),
    (1, 'Green Arrow (Volume 6)', 'Green Arrow serie from 2016', '2016-08-01T00:00:00', '2019-05-01T00:00:00');

INSERT INTO issues(series_id, added_by, "name", "number", cover_date, parution_date) VALUES 
    (1, 1, 'Dark Knights: Metal #1', 1, '2017-10-01T00:00:00', '2017-08-16T00:00:00'),
    (1, 1, 'Dark Knights: Metal #2', 2, '2017-11-01T00:00:00', '2017-09-13T00:00:00'),
    (2, 1, 'Dark Days: The Forge', 1, '2017-08-01T00:00:00', '2017-06-14T00:00:00'),
    (3, 1, 'Dark Days: The Casting', 1, '2017-09-01T00:00:00', '2017-07-12T00:00:00'),
    (4, 1, 'Gotham Resistance, Part 1: The Riddler''s Labyrinth', 12, '2017-11-01T00:00:00', '2017-09-13T00:00:00'),
    (5, 1, 'Gotham Resistance, Part 2: A Ring of Ice and Fear', 29, '2017-11-01T00:00:00', '2017-09-20T00:00:00'),
    (6, 1, 'Gotham Resistance, Part 3: Welcome to the Jungle', 26, '2017-11-01T00:00:00', '2017-09-27T00:00:00'),
    (7, 1, 'Gotham Resistance, Finale', 26, '2017-12-01T00:00:00', '2017-10-04T00:00:00');

INSERT INTO books_issues(book_id, issue_id) VALUES
    -- Batman metal T1
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8);

-- Add the first edition image to the book as a default img
UPDATE books b SET img_url = (select e.img_url from editions e where e.book_id = b.id order by e.parution_date  ASC limit 1);