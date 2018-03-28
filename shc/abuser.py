import requests
import json
import dateutil.parser
import datetime

def calc(acc_name ,res, last_day, numdays):
    all_vweight = 0
    all_rshares = 0
    self_rshares = 0
    sum_of_share_squared = 0
    vtarget = dict()
    min_day = last_day - datetime.timedelta(days = numdays)
    for v in reversed(res):
        ts = dateutil.parser.parse(v["time"])
        if ts > min_day and ts <= last_day:
            name = v['authorperm'].split("/")[0]
            all_vweight += float(v['percent'])
            all_rshares += float(v['rshares'])
            if name == acc_name:
                self_rshares += float(v['rshares'])
            if name not in vtarget:
                vtarget[name] = 0
            vtarget[name] += float(v['rshares'])
        else:
            break
    for v in vtarget:
        sum_of_share_squared += (vtarget[v] / float(all_rshares)) ** 2
    inverse_simpson = 1.0 / float(sum_of_share_squared)
    result = {}
    result['start_date'] = min_day.timestamp()
    result['end_date'] = last_day.timestamp()
    result['days'] = numdays
    result['avg_full_voting_per_day'] = all_vweight/10000/numdays
    result['self_vote'] = self_rshares/all_rshares*100
    result['invers_simpson'] = inverse_simpson
    result['top_votee'] = []
    for v in sorted(vtarget, key=vtarget.get, reverse=True)[0:10]:
        result['top_votee'].append({'account': v, 'percentage': vtarget[v]/all_rshares*100, 'rshares': int(vtarget[v])})
    return result

def vote_stats(acc_name, last_day):
    result = []
    sub = json.dumps({"jsonrpc": "2.0", "id": 0, "method": "call", "params": [0, "get_account_votes", [acc_name]]})
    res = requests.post("https://api.steemit.com", data=sub).json()["result"]
    result.append(calc(acc_name, res, last_day, 7))
    result.append(calc(acc_name, res, last_day, 14))
    result.append(calc(acc_name, res, last_day, 30))
    result.append(calc(acc_name, res, last_day, 60))
    result.append(calc(acc_name, res, last_day, 90))
    return result


def main():
    users = ['asbear', 'clayop', 'shiho', 'dakfn', 'noctisk', 'uksama', 'umkin', 'kimthewriter']
    start_date = datetime.datetime.now()
    for idx, user in enumerate(users):
        print('Processing %s [%d/%d]' % (user, idx+1, len(users)))
        result_list = vote_stats(user, start_date)
        with open('./output/2018_04/%s.json' % user, 'w') as fp:
            json.dump(result_list, fp, indent=4)

if __name__ == "__main__":
    main()
