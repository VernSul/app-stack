import os
import secrets
import base64
import hashlib
from requests_oauthlib import OAuth2Session


etsy_keystring = "63pjadbmuzk8i0q1acnulphs"
etsy_scope = ["transactions_w", "transactions_r", "listings_w", "listings_r"]
callback_url = "https://eo9byddcs814sus.m.pipedream.net"
etsy_state = "superstate"
etsy_code_verifier = "qwo0x5IVoauhnOs8Nkhb_xik42yX_ffdDT6k4HPrtYKJmSKfVRzz5Nff9N-_bzkN"
etsy_auth_code = "DOGQ8P-2bSXe-sXNhWZBq2jhnkg7rQm0DjXSG-gKMtoeOooOgHwr4t3G0t8zr70s9VDo5c1i9vc7gTOVT__3UvaaPrhF76Q3b01d"
print(etsy_code_verifier)

code_verifier = secrets.token_urlsafe(48)

def generate_challenge(code_verifier):
   m = hashlib.sha256(code_verifier.encode("utf-8"))
   b64_encode = base64.urlsafe_b64encode(m.digest()).decode("utf-8")
   # per https://docs.python.org/3/library/base64.html, there may be a trailing '=' - get rid of it
   return b64_encode.split("=")[0]

code_challenge = generate_challenge(etsy_code_verifier)


def get_auth_code(keystring, redirect_url, scopes, code_challenge, etsy_state):
				
  oauth = OAuth2Session(keystring, redirect_uri=redirect_url, scope=scopes)
  authorisation_url, state = oauth.authorization_url(
						"https://www.etsy.com/oauth/connect",
						state=etsy_state,
						code_challenge=code_challenge,
						code_challenge_method="S256",
						)
  return authorisation_url, state


def get_access_token(keystring, auth_code, code_verifier, redirect_url, scopes):
  
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "x-api-key": keystring,
    }
    oauth = OAuth2Session(
        keystring, redirect_uri=redirect_url, scope=scopes
    )
    token = oauth.fetch_token(
        "https://api.etsy.com/v3/public/oauth/token",
        code=auth_code,
        code_verifier=code_verifier,
        include_client_id=True,
        headers=headers,
    )
    return token

token = {'access_token': '962014629.Ux7su6mu5qyIm8_QLXV5KlC9woSWP4TImdzjN4GapzexLDA_yC3mQPtd0fhA_qIwPOSbw-ZmqwHxQJ6BaL2i4PgSG0', 
         'token_type': 'Bearer', 
         'expires_in': 3600, 
         'refresh_token': '962014629.xYwypdNkTM3KmXZQEWfJhrREdbRTNXpA3Ns99c7_R1gM6oCS5RkHQfJaRbzKjd6syBcP6tYWaqXmlAkQ9C7IGf-ZCu', 
         'expires_at': 1731017396.5911832
         }
def token_saver(token):
   print(token)

def get_shop_id(keystring, token):
  
    headers = {
		"Accept": "application/json",
		"Content-Type": "application/x-www-form-urlencoded",
		"x-api-key": keystring,
    	      }
    
    refresh_url = "https://api.etsy.com/v3/public/oauth/token"
    
    etsy_auth = OAuth2Session(keystring, token=token, auto_refresh_url=refresh_url, token_updater=token_saver)
    
    r = etsy_auth.get("https://api.etsy.com/v3/application/shops?shop_name=HortensiaLight", headers=headers)
    print(r.text)

# print(get_shop_id(etsy_keystring, token))

# print(get_access_token(etsy_keystring, etsy_auth_code, etsy_code_verifier, callback_url, etsy_scope))

print(get_auth_code(etsy_keystring, callback_url, etsy_scope, code_challenge, etsy_state))