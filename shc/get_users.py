#!/usr/local/bin/python3

#https://tool.steem.world/Api/GetUsersByVests?minSP=10000
#https://tool.steem.world/Api/GetUsersByVestsWithDelegation?minSP=10000



import requests
import json
import sys
import datetime

users_to_skip = ["minnowsupport"]

res = requests.get("https://tool.steem.world/Api/GetUsersByVestsWithDelegation?minSP=10000").json()

users = [item['username'] for item in res]

for user in users_to_skip:
    if user in users: users.remove(user)

print("User count: %d" % len(users))

with open('./user_list.txt', 'w') as fp:
    fp.write(" ".join(users))