#!/usr/local/bin/python3

from optparse import OptionParser
import requests
import json
import sys
import glob
import dateutil.parser
import datetime
from operator import itemgetter

def calculate_for_duration(acc_name ,res, last_day, numdays, index = 0):
    all_vweight = 0
    plus_rshares = 0
    minus_rshares = 0
    self_rshares = 0
    sum_of_share_squared = 0
    upvtarget = dict()
    dnvtarget = dict()
    min_day = last_day - datetime.timedelta(days = numdays)
    count = 0
    upvote = 0
    downvote = 0
    for v in res[index:]:
        ts = dateutil.parser.parse(v["time"])
        if ts > min_day and ts <= last_day:
            rshares = float(v['rshares'])
            name = v['authorperm'].split("/")[0]
            all_vweight += float(v['percent'])

            if rshares >= 0:
                plus_rshares += rshares
                upvote += 1
                if name not in upvtarget:
                    upvtarget[name] = 0
                upvtarget[name] += rshares
            else:
                minus_rshares += -rshares
                downvote += 1
                if name not in dnvtarget:
                    dnvtarget[name] = 0
                dnvtarget[name] += -rshares

            if name == acc_name:
                self_rshares += rshares

            count += 1
        else:
            break
    
    if plus_rshares == 0:
        inverse_simpson = 100
    else:
        for v in upvtarget:
            sum_of_share_squared += (upvtarget[v] / float(plus_rshares)) ** 2
        inverse_simpson = round(1.0 / float(sum_of_share_squared))

    upvotee = []
    downvotee = []
    if plus_rshares > 0:
        for v in sorted(upvtarget, key=upvtarget.get, reverse=True)[0:10]:
            upvotee.append({'account': v, 'percentage': round(upvtarget[v]/plus_rshares*100, 2), 'rshares': int(upvtarget[v])})
    if minus_rshares > 0:
        for v in sorted(dnvtarget, key=dnvtarget.get, reverse=True)[0:10]:
            downvotee.append({'account': v, 'percentage': round(dnvtarget[v]/minus_rshares*100, 2), 'rshares': int(dnvtarget[v])})

    return {
        'start_date': min_day.strftime("%Y-%m-%d"),
        'end_date': last_day.strftime("%Y-%m-%d"),
        'days': numdays,
        'all_vweight': all_vweight,
        'plus_rshares': plus_rshares,
        'minus_rshares': minus_rshares,
        'self_rshares': self_rshares,
        'sum_of_share_squared': sum_of_share_squared,
        'vcount': count,
        'inverse_simpson': inverse_simpson,
        'avg_full_voting_per_day': round(all_vweight/10000/numdays, 2),
        'upvcount': upvote,
        'upvotee_count': len(upvtarget),
        'dnvcount': downvote,
        'dnvotee_count': len(dnvtarget),
        'self_vote_rate': round(self_rshares/plus_rshares*100 if plus_rshares > 0 else 0, 2),
        'upvotee': upvotee,
        'downvotee': downvotee
    }

def weekly_trend(acc_name, res, last_day, weeks):
    periods = []
    val = None
    processed = 0
    for week in range(0, weeks):
        end_date = last_day - datetime.timedelta(days = 7 * week)
        val = calculate_for_duration(acc_name, res, end_date, 7, processed)
        processed += val['vcount']
        periods.append(val)
    return periods


def accumulated_trend(acc_name ,res, last_day):
    periods = []
    for period in [7, 14, 30, 60, 90]:
        periods.append(calculate_for_duration(acc_name, res, last_day, period))
    return periods

def vote_stats(acc_name, last_day):
    result = {'accumulated': [], 'weekly': []}
    # Read account info
    sub = json.dumps({"jsonrpc": "2.0", "id": 0, "method": "call", "params": [0, "get_accounts", [[acc_name]]]})
    res = requests.post("https://api.steemit.com", data=sub).json()['result'][0]
    for key in ['owner', 'active', 'posting', 'memo_key']:
        del res[key]
    result['account'] = res

    # Read voting history
    sub = json.dumps({"jsonrpc": "2.0", "id": 0, "method": "call", "params": [0, "get_account_votes", [acc_name]]})
    res = requests.post("https://api.steemit.com", data=sub).json()["result"]

    res = sorted(res, key=itemgetter('time'), reverse=True)

    result['accumulated'] = accumulated_trend(acc_name, res, last_day)
    result['weekly'] = weekly_trend(acc_name, res, last_day, 7)
    return result

def process(users, output_path):
    start_date = datetime.datetime.now()
    for idx, user in enumerate(users):
        print('Processing %s [%d/%d]' % (user, idx+1, len(users)))
        result_list = vote_stats(user, start_date)
        with open(output_path + '/%s.json' % user, 'w') as fp:
            json.dump(result_list, fp, indent=4)

def read_json(path):
    with open(path) as f:
        return json.load(f)

def vestToSp(vestStr):
    return round(float(vestStr.split()[0])/2054.45)

def summary(path):
    print('Scan ' + path + 'and build the summary file')
    files = glob.glob(path + '/*.json')
    result = []
    for file in files:
        if file.endswith('0_summary.json'):
            continue
        data = read_json(file)
        account = data['account']
        result.append(
            {
                'userid': account['name'],
                'sp': vestToSp(account['vesting_shares']),
                'delegated_sp': vestToSp(account['delegated_vesting_shares']),
                'received_sp': vestToSp(account['received_vesting_shares']),
                'acc_rshare': [item['plus_rshares'] for item in data['accumulated']],
                'acc_is': [item['inverse_simpson'] for item in data['accumulated']],
                'acc_avg_fullvote_day': [item['avg_full_voting_per_day'] for item in data['accumulated']],
                'acc_selfvote_rate': [item['self_vote_rate'] for item in data['accumulated']],
                'week_is': [item['inverse_simpson'] for item in  data['weekly']],
                'week_avg_fullvote_day': [item['avg_full_voting_per_day'] for item in data['weekly']],
                'week_selfvote_rate': [item['self_vote_rate'] for item in data['weekly']],
            }
        )
    # Order by acc_is 90 days
    result = sorted(result, key=lambda k: k['acc_is'][-1], reverse=True)
    with open(path + '/0_summary.json', 'w') as fp:
        json.dump(result, fp)
    print('Summary out is generated')
    

def main():
    parser = OptionParser()
    parser.add_option("-f", "--file", dest="filename", help="Read users from a file", metavar="file name")
    parser.add_option("-i", "--index", dest="index", help="Start index from the input", default=0, metavar="index")
    parser.add_option("-o", "--output", dest="output_path", help="Output directory", metavar="path")
    parser.add_option("-u", "--users", dest="users", help="Users, separated by space", metavar="user ID")
    parser.add_option("-s", "--summary", dest="summary", help="Scan and build index only", metavar="path")

    (options, args) = parser.parse_args()

    if options.summary:
        summary(options.summary)
        sys.exit(0)

    if not options.output_path:
        parser.error("Output path is not specified. use --help")
    if options.users:
        users = options.users.split()
    elif options.filename:
        users = open(options.filename).read().replace("\n", " ").split()
    else:
        parser.error("No source is specified. use --help")

    process(users[int(options.index):], options.output_path)
    summary(options.output_path)

if __name__ == "__main__":
    main()
