#!/usr/bin/env python
# encoding: utf-8

from flask import Flask
from flask import Response
import json

from flask import redirect
from flask import render_template
from flask import request
from flask import url_for

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

            if any([_ in u'！，。？（） 【】' for _ in [from_word, to_word]]):
                from_id = to_id
                from_word = to_word
                continue
            try:
                link_ins = Link.get(Link.from_word == from_id, Link.to_word == to_id)
                link_ins.count += 1
                link_ins.save()
            except Link.DoesNotExist:
                Link(from_word=from_id, to_word=to_id, count=1).save()

            from_id = to_id
            from_word = to_word

    return response(data=get_all_data())


@app.route('/clear')
def clear():
    Link.delete().execute()
    Word.delete().execute()
    return response(data=get_all_data())


@app.route('/delete', methods=['POST'])
def delete():
    word_id = request.form.get('data')
    Link.delete().where(Link.from_word == word_id).execute()
    Link.delete().where(Link.to_word == word_id).execute()
    Word.delete().where(Word.id == word_id).execute()
    return response(data=get_all_data())


@app.route('/load', methods=['GET'])
def load():
    return response(data=get_all_data())

@app.route('/new', methods=['GET', 'POST'])
def new():
    if request.method == 'GET':
        return render_template('word.html')
    else:
        data = getdata()
        try:
            from_ins = Word.get(Word.word == data.get('name'))
            from_ins.count += 1
            if from_ins.trans and data.get('trans') not in from_ins.trans:
                from_ins.trans += ',' + data.get('trans')
            from_ins.save()
        except Word.DoesNotExist:
            from_ins = Word(word=data.get('name'), trans=data.get('trans'), count=1)
            from_ins.save()
        return render_template('word.html')

@app.route('/copy', methods=['GET', 'POST'])
def _copy():
    if request.method == 'GET':
        sqls = [_ for _ in Sqls.select()]
        return render_template('copy.html', sqls=sqls)
    else:
        data = getdata()
        Sqls(sql=data.get('sql')).save()
        return redirect(url_for('copy'))




if __name__ == "__main__":
    app.run(host='0.0.0.0', port='7000')
