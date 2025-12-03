INSERT INTO series (added_by, "name", ongoing, oneshot, nvolumes, vo_start, vo_end) VALUES
    (1, 'Batman Metal', false, false, 3, '2017-08-01T00:00:00Z', '2018-05-01T00:00:00Z'),
    (1, 'Nightwing Infinite', false, false, 1,'2021-05-01T00:00:00Z', '2024-12-01T00:00:00Z');

INSERT INTO books (series_id, added_by, "name", "desc", "number", vo_content) VALUES
    (1, 1, 'Batman Metal Volume 1', 'The first volume of Batman Metal', 1, 'Content of Batman Metal Volume 1'),
    (1, 1, 'Batman Metal Volume 2', 'The second volume of Batman Metal', 2, 'Content of Batman Metal Volume 2'),
    (1, 1, 'Batman Metal Volume 3', 'The third volume of Batman Metal', 3, 'Content of Batman Metal Volume 3'),
    (2, 1, 'Nightwing Infinite', 'A special issue of Nightwing Infinite', 1, 'Content of Nightwing Infinite');

INSERT INTO publishers (name) VALUES('Urban Comics');

INSERT INTO editions (isbn, ean, price, url, img_url, cover_type, parution_date, publisher_id, book_id, added_by) VALUES
    ('9791026813781', '9791026813781', 22.5, 'https://www.urban-comics.com/batman-metal-tome-1/', 'https://bdi.dlpdomain.com/album/9791026813781/couv/M385x862/batman-metal-tome-1.jpg', 'Hardcover', '2018-05-25T00:00:00Z', 1, 1, 1),
    ('', '9791026813873', 25.0, 'https://www.urban-comics.com/batman-metal-tome-2/', 'https://bdi.dlpdomain.com/album/9791026813873/couv/M385x862/batman-metal-tome-2.jpg', 'Hardcover', '2018-07-06T00:00:00Z', 1, 2, 1),
    ('', '9791026824107', 25.0, 'https://www.urban-comics.com/batman-metal-tome-3/', 'https://bdi.dlpdomain.com/album/9791026824107/couv/M385x862/batman-metal-tome-3.jpg', 'Hardcover', '2018-11-02T00:00:00Z', 1, 3, 1),
    ('', '9791026819707', 18.5, 'https://www.urban-comics.com/nightwing-infinite-tome-1/', 'https://bdi.dlpdomain.com/album/9791026819707/couv/M385x862/nightwing-infinite-tome-1.jpg', 'Hardcover', '2022-02-25T00:00:00Z', 1, 4, 1);

INSERT INTO issue_series(added_by, "name", "desc", vo_start, vo_end) VALUES
    (1, 'Dark Knights: Metal Vol 1', 'Dark Knights: Metal event monthly parution', '2017-10-01T00:00:00Z', '2018-05-01T00:00:00Z');

INSERT INTO issues(series_id, added_by, "name", "number", parution_date) VALUES 
    (1, 1, 'Dark Knights: Metal (2017) #1', 1, '2017-08-16T00:00:00Z'),
    (1, 1, 'Dark Knights: Metal (2017) #2', 2, '2017-09-13T00:00:00Z');

INSERT INTO books_issues(book_id, issue_id) VALUES
    (1, 1), (1, 2);
