- Frontend section of Flipanion Projekt - 

## Schnellstart — Frontend

    1. Ins Frontend-Verzeichnis wechseln:

    ```bash
    cd "Flipanion React Frontend/flipanion"
    ```

    2. Ins Backend-Verzeichnis wechseln:

    ```bash
    cd "Flipanion React Backend/"
    ```

    3. Abhängigkeiten installieren:

    ```bash
    pnpm install
    ```

    4. Umweltvariablen setzen (lokal z. B. in `.env.local`):

    ```env
    NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
    ```

    5. Dev-Server starten:

    ```bash
    pnpm dev
    ```

    Die App läuft dann unter `http://localhost:3000`.