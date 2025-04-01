# Authentication Flow Diagrams

## Registration Flow

```mermaid
graph TD
    A[Landing Page] --> B[Register Button]
    B --> C[Step 1: Basic Info]
    C -->|Valid Info| D[Step 2: Academic Info]
    D -->|Subject Selection| E[Step 3: Preferences]
    E -->|Complete| F[Dashboard]

    C -->|Invalid| C1[Show Errors]
    C1 --> C

    subgraph "Step 1: Basic Info"
        C2[Username] --> C3[Email]
        C3 --> C4[Password]
        C4 --> C5[Profile Picture]
    end

    subgraph "Step 2: Academic Info"
        D2[Select Subjects] --> D3[Choose Session]
        D3 --> D4[Institution]
        D4 --> D5[Study Goals]
    end

    subgraph "Step 3: Preferences"
        E2[Notifications] --> E3[Study Reminders]
        E3 --> E4[Forum Preferences]
    end
```

## Profile Management Flow

```mermaid
graph TD
    A[Header Profile] --> B{Profile Menu}
    B --> C[View Profile]
    B --> D[Settings]
    B --> E[Logout]

    C --> F[Personal Info]
    C --> G[Academic Info]
    C --> H[Activity]

    D --> I[Account Settings]
    D --> J[Academic Settings]
    D --> K[Preferences]

    subgraph "Profile View"
        F --> F1[Edit Profile]
        G --> G1[Update Subjects]
        H --> H1[Progress Stats]
    end

    subgraph "Settings"
        I --> I1[Security]
        I --> I2[Privacy]
        J --> J1[Study Settings]
        K --> K1[Notifications]
    end
```

## Forum Integration

```mermaid
graph TD
    A[Forum Page] --> B{Auth Status}
    B -->|Not Logged In| C[Limited View]
    B -->|Logged In| D[Full Access]

    C --> E[View Posts]
    C --> F[Read Only]
    C -->|Try to Interact| G[Login Prompt]

    D --> H[Create Posts]
    D --> I[Comment]
    D --> J[Save Posts]

    subgraph "Personalization"
        D --> K[Subject Feed]
        D --> L[Notifications]
        D --> M[Bookmarks]
    end

    G -->|Click Login| N[Auth Page]
    N -->|Success| D
```

This visualization shows the main flows and interactions in the new authentication and profile system. The modular design allows for easy extension with new features while maintaining a clear and intuitive user experience.

## Technical Architecture

```mermaid
graph TD
    A[Client] -->|API Requests| B[Next.js API Routes]
    B -->|Auth| C[Auth Controller]
    B -->|Profile| D[Profile Controller]
    B -->|Settings| E[Settings Controller]

    C --> F[MongoDB]
    D --> F
    E --> F

    subgraph "Database Collections"
        F --> G[Users]
        F --> H[Preferences]
        F --> I[Activities]
    end

    subgraph "Middleware"
        B --> J[Auth Middleware]
        B --> K[Validation]
        B --> L[Error Handling]
    end
```

The technical architecture ensures clean separation of concerns while maintaining high performance and scalability. The modular structure allows for easy addition of new features and modifications to existing ones.
