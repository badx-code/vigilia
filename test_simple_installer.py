import urllib.request
import ssl
import json
import base64

# Let's see if we can expose a tiny curl one-liner from public url
# Wait, why did the previous curl fail? 
# Maybe Cloud Run ingress blocks curl without User-Agent or requires SSL certs or redirects.
