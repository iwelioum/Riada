# Data Dictionary

This file summarizes the core persistent fields exposed by the Riada domain. Types follow MySQL defaults unless noted.

## Members
| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| Id | uint | No | Primary key |
| FirstName | varchar(100) | No | |
| LastName | varchar(100) | No | |
| Email | varchar(100) | No | Unique |
| Gender | enum(male,female,unspecified) | No | Defaults to unspecified |
| DateOfBirth | date | No | Age >= 16 |
| Nationality | varchar(100) | Yes | Defaults to `Belgian` |
| MobilePhone | varchar(30) | Yes | |
| AddressStreet | varchar(255) | Yes | |
| AddressCity | varchar(120) | Yes | |
| AddressPostalCode | varchar(20) | Yes | |
| Status | enum(Active,Inactive,Banned) | No | Defaults to Active |
| ReferralMemberId | uint | Yes | FK Members.Id |
| PrimaryGoal | enum(...) | Yes | Fitness goal |
| AcquisitionSource | enum(...) | Yes | Marketing source |
| MedicalCertificateProvided | bool | No | |
| MarketingConsent | bool | No | |
| GdprConsentAt | datetime | No | |
| LastVisitDate | date | Yes | |
| TotalVisits | uint | No | Defaults to 0 |
| CreatedAt | datetime | No | |
| UpdatedAt | datetime | No | |

## Contracts
| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| Id | uint | No | Primary key |
| MemberId | uint | No | FK Members.Id |
| PlanName | varchar(120) | No | |
| StartDate | date | No | |
| EndDate | date | Yes | Null when active |
| Status | enum(Active,Frozen,Cancelled) | No | |
| Price | decimal(10,2) | No | |
| CreatedAt | datetime | No | |
| UpdatedAt | datetime | No | |

## Invoices
| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| Id | uint | No | Primary key |
| ContractId | uint | No | FK Contracts.Id |
| Amount | decimal(10,2) | No | |
| Status | enum(Pending,Paid,Overdue) | No | |
| DueDate | date | No | |
| IssuedAt | datetime | No | |
| PaidAt | datetime | Yes | |

## Equipment
| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| Id | uint | No | Primary key |
| Name | varchar(120) | No | |
| Category | varchar(80) | Yes | |
| Status | enum(Available,Maintenance,OutOfOrder) | No | |
| LastMaintenanceAt | datetime | Yes | |
| CreatedAt | datetime | No | |
| UpdatedAt | datetime | No | |

## Courses
| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| Id | uint | No | Primary key |
| Title | varchar(120) | No | |
| Coach | varchar(120) | No | |
| Capacity | int | No | |
| StartTime | datetime | No | |
| DurationMinutes | int | No | |
| CreatedAt | datetime | No | |
| UpdatedAt | datetime | No | |

## Guests
| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| Id | uint | No | Primary key |
| FullName | varchar(120) | No | |
| Email | varchar(120) | Yes | |
| Status | enum(Active,Banned) | No | |
| VisitDate | date | No | |
| CreatedAt | datetime | No | |
