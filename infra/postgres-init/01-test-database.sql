-- Integration tests apply and roll back migrations, so they get their own database.
CREATE DATABASE lbl_test OWNER lbl;
