# ---------------------------------------------------------
# 1. HEALTH CHECK
# ---------------------------------------------------------
GET {{base_url}}/v1/health
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"

# ---------------------------------------------------------
# 2. REJECT UNSUPPORTED CONTENT TYPE (XML)
# ---------------------------------------------------------
POST {{base_url}}/v1/fragments
Content-Type: application/xml
`<note>hello</note>`
HTTP 415
[Asserts]
jsonpath "$.status" == "error"

# ---------------------------------------------------------
# 3. CREATE TEXT/PLAIN FRAGMENT
# ---------------------------------------------------------
POST {{base_url}}/v1/fragments
Content-Type: text/plain
`hello from hurl`
HTTP 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
[Captures]
frag_id: jsonpath "$.fragment.id"

# ---------------------------------------------------------
# 4. LIST FRAGMENTS (IDS ONLY)
# ---------------------------------------------------------
GET {{base_url}}/v1/fragments
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"

# ---------------------------------------------------------
# 5. LIST FRAGMENTS (EXPANDED)
# ---------------------------------------------------------
GET {{base_url}}/v1/fragments?expand=1
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"

# ---------------------------------------------------------
# 6. GET FRAGMENT METADATA
# ---------------------------------------------------------
GET {{base_url}}/v1/fragments/{{frag_id}}
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{frag_id}}"
jsonpath "$.fragment.type" == "text/plain"

# ---------------------------------------------------------
# 7. GET RAW FRAGMENT DATA
# ---------------------------------------------------------
GET {{base_url}}/v1/fragments/{{frag_id}}/raw
HTTP 200
[Asserts]
header "content-type" startsWith "text/plain"

# ---------------------------------------------------------
# 8. UPDATE EXISTING FRAGMENT
# ---------------------------------------------------------
PUT {{base_url}}/v1/fragments/{{frag_id}}
Content-Type: text/plain
`updated from hurl`
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"

# ---------------------------------------------------------
# 9. GET RAW DATA AFTER UPDATE
# ---------------------------------------------------------
GET {{base_url}}/v1/fragments/{{frag_id}}/raw
HTTP 200
[Asserts]
header "content-type" startsWith "text/plain"

# ---------------------------------------------------------
# 10. DELETE FRAGMENT
# ---------------------------------------------------------
DELETE {{base_url}}/v1/fragments/{{frag_id}}
HTTP 200
[Asserts]
jsonpath "$.status" == "ok"

# ---------------------------------------------------------
# 11. CONFIRM DELETED FRAGMENT RETURNS 404
# ---------------------------------------------------------
GET {{base_url}}/v1/fragments/{{frag_id}}
HTTP 404
[Asserts]
jsonpath "$.status" == "error"

# ---------------------------------------------------------
# 12. CREATE MARKDOWN FRAGMENT
# ---------------------------------------------------------
POST {{base_url}}/v1/fragments
Content-Type: text/markdown
`# Title **bold** text`
HTTP 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/markdown"
[Captures]
md_id: jsonpath "$.fragment.id"

# ---------------------------------------------------------
# 13. MARKDOWN → HTML
# ---------------------------------------------------------
GET {{base_url}}/v1/fragments/{{md_id}}.html
HTTP 200
[Asserts]
header "content-type" startsWith "text/html"

# ---------------------------------------------------------
# 14. MARKDOWN → PLAIN TEXT
# ---------------------------------------------------------
GET {{base_url}}/v1/fragments/{{md_id}}.txt
HTTP 200
[Asserts]
header "content-type" startsWith "text/plain"
  