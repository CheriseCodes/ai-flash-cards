# How to configure the frontend

The location of the backend service will be different depending on the platform and stage it is ran. Expected values are:

| BACKEND_ENDPOINT | BACKEND_PATH | Platform |
| ---------------- | ------------ | -------- |
| "https://demo.localdev.me" | "/backend" | kubernetes / development |
| "https://localhost:8000" | "/backend" | kubernetes / staging / production |
| "http://localhost" | "" | docker / development / test |
| "http://localhost:8000" | "" | docker / staging / production |
| "http://localhost:3000" | "" |docker / test
