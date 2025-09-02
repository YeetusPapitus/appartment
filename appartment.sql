-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 02, 2025 at 11:36 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `appartment`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `IDAdmin` int(11) NOT NULL,
  `Username` varchar(100) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`IDAdmin`, `Username`, `Password`, `Timestamp`) VALUES
(1, 'markosego', '$2y$10$cPOU1sQxOwVq1KvLGbrQw.jfgralX4TPEnjHw9RgnZtv4sfl3s2UW', '2025-08-30 13:59:17');

-- --------------------------------------------------------

--
-- Table structure for table `amenity`
--

CREATE TABLE `amenity` (
  `IDAmenity` int(11) NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `amenity`
--

INSERT INTO `amenity` (`IDAmenity`, `Title`, `Timestamp`) VALUES
(2, 'a', '2025-08-09 16:05:48'),
(3, 'b', '2025-08-09 16:05:51'),
(4, 'c', '2025-08-09 16:05:53'),
(5, 'd', '2025-08-09 16:05:55'),
(6, 'e', '2025-08-09 16:05:57'),
(7, 'f', '2025-08-09 16:06:00'),
(8, 'g', '2025-08-09 16:06:01'),
(9, 'h', '2025-08-09 16:06:04'),
(10, 'i', '2025-08-09 16:06:06'),
(11, 'j', '2025-08-09 16:06:08'),
(12, 'k', '2025-08-09 16:06:57'),
(13, 'l', '2025-08-09 16:07:00'),
(14, 'm', '2025-08-09 16:07:06'),
(15, 'n', '2025-08-09 16:07:09'),
(16, 'o', '2025-08-09 16:07:16'),
(17, 'p', '2025-08-09 16:07:18'),
(18, 'q', '2025-08-09 16:07:19'),
(19, 'r', '2025-08-09 16:07:21'),
(20, 's', '2025-08-09 16:07:24'),
(21, 'afsafsa', '2025-08-31 16:00:19');

-- --------------------------------------------------------

--
-- Table structure for table `contact`
--

CREATE TABLE `contact` (
  `IDContact` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Message` mediumtext NOT NULL,
  `Status` varchar(255) NOT NULL DEFAULT 'Pending',
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact`
--

INSERT INTO `contact` (`IDContact`, `Name`, `Email`, `Message`, `Status`, `Timestamp`) VALUES
(5, 'a', 'a@gmail.com', 'a', 'Pending', '2025-08-08 16:16:59'),
(6, 'safas', 'gas@gmail.com', 'hgdgas', 'Read', '2025-08-31 15:56:06');

-- --------------------------------------------------------

--
-- Table structure for table `image`
--

CREATE TABLE `image` (
  `IDImage` int(11) NOT NULL,
  `ImageURL` varchar(255) NOT NULL,
  `RoomID` int(11) NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `IsPrimary` tinyint(1) NOT NULL DEFAULT 0,
  `SortOrder` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `image`
--

INSERT INTO `image` (`IDImage`, `ImageURL`, `RoomID`, `Timestamp`, `IsPrimary`, `SortOrder`) VALUES
(2, '/appartment/uploads/1754745760_727788d3ac8d.jpg', 6, '2025-08-09 13:22:40', 0, 2),
(4, '/appartment/uploads/1754746120_78e002b3dd1f.jpg', 7, '2025-08-09 13:28:40', 1, 2),
(5, '/appartment/uploads/1754746415_9849c96e7263.jpg', 8, '2025-08-09 13:33:35', 1, 3),
(6, '/appartment/uploads/1754746429_ef547e93e6fd.jpg', 8, '2025-08-09 13:33:49', 0, 2),
(8, '/appartment/uploads/1754746572_1eb2740d5d25.jpg', 6, '2025-08-09 13:36:12', 1, 1),
(9, '/appartment/uploads/1754746588_aa7188a1c06c.jpg', 6, '2025-08-09 13:36:28', 0, 3),
(10, '/appartment/uploads/1754746601_3aac369521e2.jpg', 6, '2025-08-09 13:36:41', 0, 4),
(11, '/appartment/uploads/1754746605_dda9c48cd15c.jpg', 6, '2025-08-09 13:36:45', 0, 6),
(12, '/appartment/uploads/1754746609_452962fe0c64.jpg', 6, '2025-08-09 13:36:49', 0, 5),
(13, '/appartment/uploads/1754746617_4353ec8632fe.jpg', 6, '2025-08-09 13:36:57', 0, 7),
(14, '/appartment/uploads/1754746623_6bdbef4360a2.jpg', 6, '2025-08-09 13:37:03', 0, 8),
(15, '/appartment/uploads/1754746627_7b7adbbed751.jpg', 6, '2025-08-09 13:37:07', 0, 9),
(16, '/appartment/uploads/1754746681_6b584b57c063.jpg', 7, '2025-08-09 13:38:01', 0, 3);

-- --------------------------------------------------------

--
-- Table structure for table `reservation`
--

CREATE TABLE `reservation` (
  `IDReservation` int(11) NOT NULL,
  `CheckIn` date NOT NULL,
  `CheckOut` date NOT NULL,
  `Guests` int(11) NOT NULL,
  `RoomID` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `PhoneNumber` varchar(255) NOT NULL,
  `Message` mediumtext DEFAULT NULL,
  `Status` varchar(255) NOT NULL DEFAULT 'Pending',
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservation`
--

INSERT INTO `reservation` (`IDReservation`, `CheckIn`, `CheckOut`, `Guests`, `RoomID`, `Name`, `Email`, `PhoneNumber`, `Message`, `Status`, `Timestamp`) VALUES
(1, '2025-12-12', '2025-12-15', 2, 6, 'afas', 'afaf@gmail.com', '312312', 'safasfgaga', 'Denied', '2025-08-09 14:54:16'),
(2, '2025-12-06', '2025-12-08', 1, 6, 'asdas', 'asda@gmail.com', '4324322', 'dsgfadg', 'Denied', '2025-08-09 15:06:14'),
(3, '2025-08-12', '2025-08-13', 2, 6, 'safasf', 'gsa@gmail.com', '31312', '', 'Denied', '2025-08-09 15:06:50'),
(4, '2025-08-14', '2025-08-26', 1, 7, 'adgaga', 'sagasgas@gmial.com', '34135351', 'safsafasg', 'Denied', '2025-08-09 15:41:26'),
(5, '2025-12-03', '2025-12-05', 2, 6, 'sadas', 'sadas@gmail.com', '235325', 'dgadga', 'Accepted', '2025-08-09 18:39:46'),
(6, '2025-08-11', '2025-08-14', 2, 6, 'dbgadg', 'fas@gmail.com', '32432', 'dgadg', 'Accepted', '2025-08-09 18:52:20'),
(7, '2025-08-14', '2025-08-16', 2, 6, 'dgassg', 'gasga@gmail.com', '4262363262', 'sfdgsdhdhhjhjsdhs', 'Accepted', '2025-08-09 18:58:23'),
(8, '2025-09-03', '2025-09-04', 1, 6, 'sfdas', 'fas@gmail.com', '2432', '', 'Pending', '2025-08-30 15:48:18'),
(9, '2025-08-30', '2025-08-31', 1, 6, 'asfas', 'dsa@gmail.com', '312312', '', 'Accepted', '2025-08-30 15:51:55'),
(10, '2025-09-01', '2025-09-05', 2, 6, 'sagas', 'hdhds@gmail.com', '3531', '', 'Accepted', '2025-08-30 16:00:45'),
(11, '2025-11-06', '2025-11-08', 3, 8, 'safas', 'fas@gmail.com', '321321', '', 'Denied', '2025-08-31 15:56:58');

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE `room` (
  `IDRoom` int(11) NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Description` mediumtext NOT NULL,
  `Price` int(11) NOT NULL,
  `BedType` varchar(255) NOT NULL,
  `BedQuantity` int(11) NOT NULL,
  `Guests` int(11) NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room`
--

INSERT INTO `room` (`IDRoom`, `Title`, `Description`, `Price`, `BedType`, `BedQuantity`, `Guests`, `Timestamp`) VALUES
(6, 'Apartment 1', 'dsgda gsagf as fas asg asg a s', 80, 'King Bed', 1, 2, '2025-08-08 16:00:30'),
(7, 'Apartment 2', 'fsasa fsa fsa fsasa fa fsa fas f', 100, 'Queen Bed', 2, 1, '2025-08-08 16:03:32'),
(8, 'Apartment 3', 'asf safsa a fasf asf asf sa fsasa fas f', 120, 'King Bed', 2, 4, '2025-08-08 16:05:17');

-- --------------------------------------------------------

--
-- Table structure for table `roomamenity`
--

CREATE TABLE `roomamenity` (
  `IDRoomAmenity` int(11) NOT NULL,
  `RoomID` int(11) NOT NULL,
  `AmenityID` int(11) NOT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roomamenity`
--

INSERT INTO `roomamenity` (`IDRoomAmenity`, `RoomID`, `AmenityID`, `Timestamp`) VALUES
(4, 6, 2, '2025-08-09 16:05:49'),
(5, 6, 3, '2025-08-09 16:05:51'),
(6, 6, 4, '2025-08-09 16:05:53'),
(7, 6, 5, '2025-08-09 16:05:55'),
(8, 6, 6, '2025-08-09 16:05:57'),
(9, 6, 7, '2025-08-09 16:06:00'),
(10, 6, 8, '2025-08-09 16:06:02'),
(11, 6, 9, '2025-08-09 16:06:04'),
(12, 6, 10, '2025-08-09 16:06:06'),
(13, 6, 11, '2025-08-09 16:06:08'),
(14, 6, 12, '2025-08-09 16:06:57'),
(15, 6, 13, '2025-08-09 16:07:00'),
(16, 6, 14, '2025-08-09 16:07:06'),
(17, 6, 15, '2025-08-09 16:07:09'),
(18, 6, 16, '2025-08-09 16:07:16'),
(19, 6, 17, '2025-08-09 16:07:18'),
(20, 6, 18, '2025-08-09 16:07:20'),
(21, 6, 19, '2025-08-09 16:07:21'),
(22, 6, 20, '2025-08-09 16:07:24'),
(23, 6, 21, '2025-08-31 16:00:19');

-- --------------------------------------------------------

--
-- Table structure for table `unavailabledate`
--

CREATE TABLE `unavailabledate` (
  `IDUnavailableDate` int(11) NOT NULL,
  `Date` date NOT NULL,
  `RoomID` int(11) NOT NULL,
  `Timestamp` int(11) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `unavailabledate`
--

INSERT INTO `unavailabledate` (`IDUnavailableDate`, `Date`, `RoomID`, `Timestamp`) VALUES
(1, '2025-01-16', 6, 2147483647),
(2, '2025-08-31', 6, 2147483647),
(3, '2025-09-18', 6, 2147483647);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`IDAdmin`),
  ADD UNIQUE KEY `Username` (`Username`);

--
-- Indexes for table `amenity`
--
ALTER TABLE `amenity`
  ADD PRIMARY KEY (`IDAmenity`);

--
-- Indexes for table `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`IDContact`);

--
-- Indexes for table `image`
--
ALTER TABLE `image`
  ADD PRIMARY KEY (`IDImage`),
  ADD KEY `FK_Image_Room_RoomId` (`RoomID`);

--
-- Indexes for table `reservation`
--
ALTER TABLE `reservation`
  ADD PRIMARY KEY (`IDReservation`),
  ADD KEY `FK_Reservation_Room_RoomId` (`RoomID`);

--
-- Indexes for table `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`IDRoom`);

--
-- Indexes for table `roomamenity`
--
ALTER TABLE `roomamenity`
  ADD PRIMARY KEY (`IDRoomAmenity`),
  ADD KEY `FK_RoomAmenity_Amenity_AmenityId` (`AmenityID`),
  ADD KEY `FK_RoomAmenity_Room_RoomId` (`RoomID`);

--
-- Indexes for table `unavailabledate`
--
ALTER TABLE `unavailabledate`
  ADD PRIMARY KEY (`IDUnavailableDate`),
  ADD KEY `FK_UnavailableDate_Room_RoomId` (`RoomID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `IDAdmin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `amenity`
--
ALTER TABLE `amenity`
  MODIFY `IDAmenity` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `contact`
--
ALTER TABLE `contact`
  MODIFY `IDContact` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `image`
--
ALTER TABLE `image`
  MODIFY `IDImage` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `reservation`
--
ALTER TABLE `reservation`
  MODIFY `IDReservation` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `room`
--
ALTER TABLE `room`
  MODIFY `IDRoom` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `roomamenity`
--
ALTER TABLE `roomamenity`
  MODIFY `IDRoomAmenity` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `unavailabledate`
--
ALTER TABLE `unavailabledate`
  MODIFY `IDUnavailableDate` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `image`
--
ALTER TABLE `image`
  ADD CONSTRAINT `FK_Image_Room_RoomId` FOREIGN KEY (`RoomID`) REFERENCES `room` (`IDRoom`);

--
-- Constraints for table `reservation`
--
ALTER TABLE `reservation`
  ADD CONSTRAINT `FK_Reservation_Room_RoomId` FOREIGN KEY (`RoomID`) REFERENCES `room` (`IDRoom`);

--
-- Constraints for table `roomamenity`
--
ALTER TABLE `roomamenity`
  ADD CONSTRAINT `FK_RoomAmenity_Amenity_AmenityId` FOREIGN KEY (`AmenityID`) REFERENCES `amenity` (`IDAmenity`),
  ADD CONSTRAINT `FK_RoomAmenity_Room_RoomId` FOREIGN KEY (`RoomID`) REFERENCES `room` (`IDRoom`);

--
-- Constraints for table `unavailabledate`
--
ALTER TABLE `unavailabledate`
  ADD CONSTRAINT `FK_UnavailableDate_Room_RoomId` FOREIGN KEY (`RoomID`) REFERENCES `room` (`IDRoom`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
