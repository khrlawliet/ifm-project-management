-- ============================================
-- Insert Sample Projects
-- ============================================
INSERT INTO project (id, name, description, created_at, updated_at) VALUES
(1, 'E-commerce Platform', 'Development of a modern e-commerce platform with microservices architecture', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Mobile App Development', 'Cross-platform mobile application for iOS and Android using React Native', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Database Migration', 'Migration from legacy Oracle database to PostgreSQL with zero downtime', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Cloud Infrastructure', 'Setup AWS cloud infrastructure with Kubernetes and CI/CD pipelines', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- Insert Sample Tasks for E-commerce Platform (Project 1)
-- ============================================
INSERT INTO task (name, priority, due_date, assignee, status, project_id, version, created_at, updated_at) VALUES
('Design Database Schema', 2, DATEADD('DAY', 3, CURRENT_DATE), 'alice.smith@company.com', 'COMPLETED', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Implement User Authentication', 1, DATEADD('DAY', 7, CURRENT_DATE), 'bob.jones@company.com', 'IN_PROGRESS', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Create Product Catalog API', 2, DATEADD('DAY', 10, CURRENT_DATE), 'charlie.brown@company.com', 'IN_PROGRESS', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Implement Shopping Cart', 3, DATEADD('DAY', 14, CURRENT_DATE), 'diana.white@company.com', 'PENDING', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Setup Payment Gateway Integration', 1, DATEADD('DAY', 21, CURRENT_DATE), 'evan.davis@company.com', 'PENDING', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Implement Order Management System', 2, DATEADD('DAY', 28, CURRENT_DATE), 'fiona.miller@company.com', 'PENDING', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- Insert Sample Tasks for Mobile App Development (Project 2)
-- ============================================
INSERT INTO task (name, priority, due_date, assignee, status, project_id, version, created_at, updated_at) VALUES
('Setup React Native Project', 3, DATEADD('DAY', -5, CURRENT_DATE), 'george.taylor@company.com', 'COMPLETED', 2, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Design UI/UX Mockups', 4, DATEADD('DAY', 2, CURRENT_DATE), 'hannah.wilson@company.com', 'IN_PROGRESS', 2, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Implement Login Screen', 2, DATEADD('DAY', 5, CURRENT_DATE), 'ian.moore@company.com', 'IN_PROGRESS', 2, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Integrate REST API', 1, DATEADD('DAY', 12, CURRENT_DATE), 'julia.anderson@company.com', 'PENDING', 2, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Add Push Notifications', 3, DATEADD('DAY', 18, CURRENT_DATE), 'kevin.thomas@company.com', 'PENDING', 2, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Implement Offline Mode', 4, DATEADD('DAY', 25, CURRENT_DATE), 'laura.jackson@company.com', 'PENDING', 2, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- Insert Sample Tasks for Database Migration (Project 3)
-- ============================================
INSERT INTO task (name, priority, due_date, assignee, status, project_id, version, created_at, updated_at) VALUES
('Analyze Current Database Schema', 1, DATEADD('DAY', -10, CURRENT_DATE), 'mike.martin@company.com', 'COMPLETED', 3, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Create PostgreSQL Schema', 2, DATEADD('DAY', -3, CURRENT_DATE), 'nancy.garcia@company.com', 'COMPLETED', 3, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Write Data Migration Scripts', 1, DATEADD('DAY', 4, CURRENT_DATE), 'oliver.rodriguez@company.com', 'IN_PROGRESS', 3, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Perform Test Migration', 2, DATEADD('DAY', 8, CURRENT_DATE), 'patricia.martinez@company.com', 'PENDING', 3, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Update Application Configuration', 3, DATEADD('DAY', 15, CURRENT_DATE), 'quinn.hernandez@company.com', 'PENDING', 3, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- Insert Sample Tasks for Cloud Infrastructure (Project 4)
-- ============================================
INSERT INTO task (name, priority, due_date, assignee, status, project_id, version, created_at, updated_at) VALUES
('Setup AWS Account and IAM', 2, DATEADD('DAY', -7, CURRENT_DATE), 'robert.lopez@company.com', 'COMPLETED', 4, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Configure VPC and Networking', 1, DATEADD('DAY', 1, CURRENT_DATE), 'sarah.gonzalez@company.com', 'IN_PROGRESS', 4, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Deploy Kubernetes Cluster', 1, DATEADD('DAY', 6, CURRENT_DATE), 'thomas.wilson@company.com', 'PENDING', 4, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Setup CI/CD Pipeline', 2, DATEADD('DAY', 11, CURRENT_DATE), 'ursula.perez@company.com', 'PENDING', 4, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Implement Monitoring and Logging', 3, DATEADD('DAY', 17, CURRENT_DATE), 'victor.sanchez@company.com', 'PENDING', 4, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- Reset Auto-Increment Sequences
-- ============================================
-- Reset project ID sequence to start from 5 (after the 4 sample projects)
ALTER TABLE project ALTER COLUMN id RESTART WITH 5;

-- Reset task ID sequence to start from 23 (after the 22 sample tasks)
ALTER TABLE task ALTER COLUMN id RESTART WITH 23;
