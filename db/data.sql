INSERT INTO series (added_by, "name", ongoing, oneshot, nvolumes, vo_start, vo_end) VALUES
    (1, 'Batman Metal', false, false, 3, '2017-08-01T00:00:00Z', '2018-05-01T00:00:00Z'),
    (1, 'Nightwing Infinite', false, false, 1,'2021-05-01T00:00:00Z', '2024-12-01T00:00:00Z');

INSERT INTO books (series_id, added_by, "name", "desc", "number", vo_content) VALUES
    (1, 1, 'Batman Metal Volume 1', 'The first volume of Batman Metal', 1, 'Content of Batman Metal Volume 1'),
    (1, 1, 'Batman Metal Volume 2', 'The second volume of Batman Metal', 2, 'Content of Batman Metal Volume 2'),
    (1, 1, 'Batman Metal Volume 3', 'The third volume of Batman Metal', 3, 'Content of Batman Metal Volume 3'),
    (2, 1, 'Nightwing Infinite', 'A special issue of Nightwing Infinite', 1, 'Content of Nightwing Infinite');