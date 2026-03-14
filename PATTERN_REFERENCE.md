# RIADA USECASE PATTERN - COMPLETE REFERENCE GUIDE

## EXECUTIVE SUMMARY

The Riada codebase uses **Clean Architecture with UseCase Pattern**. Each UseCase is:
- A simple class with **dependency injection via constructor**
- A single public method: **ExecuteAsync(RequestDTO, CancellationToken)**
- No validation code (FluentValidation handles it)
- No exception catching (middleware handles it)
- Simple orchestration of repository/service calls and DTO mapping

This document includes **complete, production-ready code examples** you can copy/paste.

---

## TABLE OF CONTENTS

1. UseCase Implementation Patterns (4 real examples)
2. DTO Patterns (Request/Response records)
3. Repository Interfaces & Implementations
4. Validators (FluentValidation)
5. Exception Hierarchy
6. Dependency Injection
7. Exception Handling Middleware
8. Controller Usage
9. Complete End-to-End Example

---

