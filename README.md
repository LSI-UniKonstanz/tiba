# The Interactive Behavior Analyzer

This tool models graphs from behavior data that is given as list ordered by time. Such data can be derived from the event-logging software [BORIS](https://www.boris.unito.it/). Three visualizations are available,depicting the temporal occurrences of behavioral events, the number and direction of interactions between individuals, and the behavioral transitions and their respective transitional frequencies. The options to set node and edge properties and to select behaviors and individuals allow for interactive customization of the output drawings, which can be downloaded afterwards.

## Availability
TIBA is available online at https://tiba.inf.uni-konstanz.de. Instructions for a local installation follow.

## Local installation
If you don't want to upload your data, simply clone this repository and test everything locally. No django models are used, so you do not have to worry about database administration. The backend only consists of python funcions and a few API endpoints that enable the frontend to use their functionality. The settings.py file may also remain unchanged, but be aware that this is only for a local test environment configured, it is unsafe to use in production.

- Install prerequisites
```bash
sudo apt install npm nodejs graphviz python3-django git
```
- Clone this repository
```bash
git clone https://github.com/LSI-UniKonstanz/tiba.git
```
- Setup and run frontend
```bash
cd tiba/frontend/
npm install
npm start
```
- Setup and run backend (using a virtual environment for python packages)
```bash
cd tiba/
python3 -m venv my_venv
source my_venv/bin/activate
pip3 install -r requirements.txt
cd backend/
python3 manage.py runserver
```

## Workflow
* Uploads behavior data as specified below or loads sample data
* Inspect and parameterize three different network types
* Compare transition networks and visualize distances 

## Visualizations for selected sample Multifasciatus
![Visualizations TIBA](/screenshots/visualizations.png)
## Comparison of transition networks 
![Compare transitions TIBA](/screenshots/comparisons.png)
