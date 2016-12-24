#!/usr/bin/env python
# -*- coding: utf-8 -*-

from peewee import *
database = MySQLDatabase('python_nlp', user='root', password='likeyiyymac', charset='utf8mb4')


class BaseModel(Model):
    class Meta:
        database = database


class Word(BaseModel):
    word = CharField(null=True, unique=True)
    count = IntegerField(default=0)


class Link(BaseModel):
    from_word = ForeignKeyField(Word, related_name='from')
    to_word = ForeignKeyField(Word, related_name='to')
    count = IntegerField(default=0)

    class Meta:
        indexes = (
            (('from_word', 'to_word'), True),
        )

