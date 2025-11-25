INSERT INTO series (added_by, "name", ongoing, oneshot, nvolumes) VALUES
    (1, 'Batman Metal', false, false, 3),
    (1, 'Nightwing Infinite', false, false, 1);

INSERT INTO books (series_id, added_by, "name", "desc", "number") VALUES
    (1, 1, 'Batman Metal Volume 1', 'The first volume of Batman Metal', 1),
    (1, 1, 'Batman Metal Volume 2', 'The second volume of Batman Metal', 2),
    (1, 1, 'Batman Metal Volume 3', 'The third volume of Batman Metal', 3),
    (2, 1, 'Nightwing Infinite', 'A special issue of Nightwing Infinite', 1);