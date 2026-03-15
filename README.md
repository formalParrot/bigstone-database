## Cotributors:
-# (in discord)
@_justParrot
@bobmat2011
---
## API Endpoints:
We use Cloudlfare Workers to deploy our API. The url is ```https://bigstone-api.justparrot.workers.dev```
<u>THE API ONLY ACCEPTS REQUESTS FROM OUR WEBSITE, OR LOCALHOST:8787</u>
### Projects (/projects/)
**POST** Create Project with (name, desc)
```
fetch('https://bigstone-api.justparrot.workers.dev', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'PROJECT NAME', desc: 'DESCRIPTION' })
})
.then(res => res.json())
.then(data => {
  console.log("Full Response Data:", data);
  console.log("ID:", data.id);
})
.catch(err => console.error("Fetch error:", err));
```
