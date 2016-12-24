from flask_script import Manager
from models import *
from run import app

manager = Manager(app)


@manager.command
def create_tables():
    database.connect()
    model_list = Model.__subclasses__()
    model_list.extend(BaseModel.__subclasses__())
    for klass in model_list:
        print(klass._meta.db_table)
        klass.create_table(fail_silently=True)

if __name__ == "__main__":
    manager.run()
