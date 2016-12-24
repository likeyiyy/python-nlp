#!/usr/bin/env python
# encoding: utf-8

from flask import Flask
from flask import Response
import json
from flask import render_template
from flask import request
from models import *

app = Flask(__name__)


def response(data):
    kwargs = {} if request.is_xhr else {'indent': 2}
    rv = Response(json.dumps(data, **kwargs), mimetype='application/json')
    return rv


def get_all_data():
    nodes = []
    edges = []
    for _ in Word.select():
        nodes.append({
            "id": _.id,
            "label": _.word,
            "value": _.count,
            "title": _.count,
        })

    for _ in Link.select():
        edges.append({
            "from": _.from_word.id,
            "to": _.to_word.id,
            "value": _.count,
            "title": _.count,
        })

    data = {
        "nodes": nodes,
        "edges": edges
    }
    return data


def getdata(key='data'):
    data = request.form.get(key)
    data = json.loads(data)
    return data

@app.route('/')
def index():
    return render_template('main.html')


@app.route('/add', methods=['POST'])
def add():
    words_str = request.form.get('data')
    if words_str:
        words = [_ for _ in words_str]
        words = zip(words, words[1:])
        from_id = None
        for from_word, to_word in words:
            if not from_id:
                try:
                    from_ins = Word.get(Word.word == from_word)
                    from_ins.count += 1
                    from_ins.save()
                except Word.DoesNotExist:
                    from_ins = Word(word=from_word, count=1)
                    from_ins.save()
                from_id = from_ins.id

            try:
                to_ins = Word.get(Word.word == to_word)
                to_ins.count += 1
                to_ins.save()
            except Word.DoesNotExist:
                to_ins = Word(word=to_word, count=1)
                to_ins.save()
            to_id = to_ins.id

            try:
                link_ins = Link.get(Link.from_word == from_id, Link.to_word == to_id)
                link_ins.count += 1
                link_ins.save()
            except Link.DoesNotExist:
                Link(from_word=from_id, to_word=to_id, count=1).save()

            from_id = to_id

    return response(data=get_all_data())


@app.route('/load', methods=['GET'])
def load():
    return response(data=get_all_data())


if __name__ == "__main__":
    app.run(host='0.0.0.0', port='7000')
