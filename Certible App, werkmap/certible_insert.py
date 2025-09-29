import json

# Bestandspad naar de lokale Certible database
database_path = "certible_export.json"

# Nieuwe invoer
new_entry = {
    "Certificate Name": "Example Certificate",
    "School / Issuer": "OpenAI Academy",
    "Subject": "AI Ethics",
    "Part of Series": "AI Professional Pathway",
    "Diploma Number": "CERT-00123",
    "Date Credential": "2025-07-07",
    "Level": "Master",
    "Language": "English",
    "Location": "Online",
    "Certification Type": "Certificate of Completion",
    "Accredited?": "Yes",
    "Accreditation Institute": "Global AI Council",
    "Valid Until": "2030-12-31",
    "Renewed?": "No",
    "Status": "Valid",
    "Renewed On": "",
    "Badge": "Yes",
    "Badge Platform": "Credly",
    "Remarks": "Imported via Python script"
}

# Bestaat database al?
try:
    with open(database_path, "r", encoding="utf-8") as f:
        data = json.load(f)
except FileNotFoundError:
    data = []

# Toevoegen en opslaan
data.append(new_entry)
with open(database_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)

print("✅ Certible entry added.")
