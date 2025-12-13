-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert 10 sample users
INSERT INTO users (username, email, full_name) VALUES
    ('john.doe', 'john.doe@ifm.com', 'John Doe'),
    ('jane.smith', 'jane.smith@ifm.com', 'Jane Smith'),
    ('bob.johnson', 'bob.johnson@ifm.com', 'Bob Johnson'),
    ('alice.williams', 'alice.williams@ifm.com', 'Alice Williams'),
    ('charlie.brown', 'charlie.brown@ifm.com', 'Charlie Brown'),
    ('diana.davis', 'diana.davis@ifm.com', 'Diana Davis'),
    ('evan.miller', 'evan.miller@ifm.com', 'Evan Miller'),
    ('fiona.wilson', 'fiona.wilson@ifm.com', 'Fiona Wilson'),
    ('george.moore', 'george.moore@ifm.com', 'George Moore'),
    ('helen.taylor', 'helen.taylor@ifm.com', 'Helen Taylor');
