DROP DATABASE IF EXISTS smart_echallan;
CREATE DATABASE smart_echallan;
USE smart_echallan;

CREATE TABLE Drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(255)
);

CREATE TABLE Officers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  badge_number VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE Vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  vehicle_number VARCHAR(20) UNIQUE NOT NULL,
  model VARCHAR(100),
  FOREIGN KEY (driver_id) REFERENCES Drivers(id) ON DELETE CASCADE
);

CREATE TABLE ViolationTypes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  fine_amount DECIMAL(10,2) NOT NULL
);

CREATE TABLE Violations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  type_id INT NOT NULL,
  date DATETIME NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  officer_id INT NOT NULL,
  status ENUM('Pending','Sent','Paid') DEFAULT 'Pending',
  FOREIGN KEY (driver_id) REFERENCES Drivers(id),
  FOREIGN KEY (vehicle_id) REFERENCES Vehicles(id),
  FOREIGN KEY (type_id) REFERENCES ViolationTypes(id),
  FOREIGN KEY (officer_id) REFERENCES Officers(id)
);

CREATE TABLE Fines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  violation_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('Pending','Paid') DEFAULT 'Pending',
  issued_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_date DATE,
  FOREIGN KEY (violation_id) REFERENCES Violations(id) ON DELETE CASCADE
);

CREATE TABLE Payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fine_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  method VARCHAR(30),
  FOREIGN KEY (fine_id) REFERENCES Fines(id) ON DELETE CASCADE
);

-- Seeds
INSERT INTO Drivers(name, license_number, username, password, phone, address)
VALUES ('Amit Kumar','DL12341234','driver1','$2b$10$2jT7E6Z3nq9U1X0l7bW7y.3wQ2n2x0bT2oR9q3Y9XqC5m8m8YgI0m','9876543210','Delhi');

INSERT INTO Officers(name, badge_number, username, password)
VALUES ('Officer Rao','HYD-5567','officer1','$2b$10$2jT7E6Z3nq9U1X0l7bW7y.3wQ2n2x0bT2oR9q3Y9XqC5m8m8YgI0m');

INSERT INTO Vehicles(driver_id, vehicle_number, model)
VALUES (1,'DL01AB1234','Honda City');

INSERT INTO ViolationTypes(name, fine_amount)
VALUES ('Red Light Jump', 500), ('Over Speeding', 1000), ('No Seatbelt', 200), ('No Helmet', 300);