# The Interactive Behavior Analyzer

This tool models graphs from behavior data that is given as list ordered by time. Such data can be derived from the event-logging software BORIS. Three visualizations are available,depicting the temporal occurrences of behavioral events, the number and direction of interactions between individuals, and the behavioral transitions and their respective transitional frequencies. The options to set node and edge properties and to select behaviors and individuals allow for interactive customization of the output drawings, which can be downloaded afterwards.

## Availability
TIBA is available online at https://tiba.inf.uni-konstanz.de. However, it is also possible to have a local installation (see below).


## Local installation
If you don't want to upload your data, simply clone this repository and test everything locally. No django models are used, so you do not have to worry about database administration. The backend only consists of python funcions and a few API endpoints that enable the frontend to use their functionality. The settings.py file may also remain unchanged, but be aware that this is only for a local test environment configured, it is unsafe to use in production.

- Install prerequisites
```bash
sudo apt install git vim curl pip graphviz python3-django
```
- Install NodeJS (example is on Ubuntu)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```
- Setup and run frontend
```bash
cd tiba-uni-konstanz/frontend/
npm install
npm start
```
- Setup and run django backend
```bash
cd ~/tiba-uni-konstanz/
pip3 install -r requirements.txt
cd ~/tiba-uni-konstanz/backend/
mkdir public/{plots,transitions,interactions}
python3 manage.py runserver
```

## Workflow
* The user uploads behavior data as specified below or loads exemplary data
* 3 different network types are generated and presented
* The user analyzes his/her data visually and interactively using different parameters

## Future work
* Graph-based comparison of transition networks

## Appearance
![1](https://user-images.githubusercontent.com/49905943/201175183-cfc39b73-cb3b-4e20-be2e-7a8ad262d1a9.png)

![2](https://user-images.githubusercontent.com/49905943/201175210-ca6be3cd-8244-4835-aa01-2a07433cf418.png)

![3](https://user-images.githubusercontent.com/49905943/201175218-2472e193-fe94-4093-ae49-d4bedac2f48c.png)

![4](https://user-images.githubusercontent.com/49905943/201175234-15e2018b-8b9d-4ce3-9e26-6f7cc7d1f575.png)

![13](https://user-images.githubusercontent.com/49905943/201176605-08937264-748d-4b7d-84a4-1f70d010897d.png)

![14](https://user-images.githubusercontent.com/49905943/201176618-9432c421-bc9c-4062-863c-f763deab043d.png)

![21](https://user-images.githubusercontent.com/49905943/201177156-582eb3a9-9f7c-4793-92cb-1565fe2021f3.png)

![16](https://user-images.githubusercontent.com/49905943/201176635-a867b28c-af7b-4106-8c19-9a901580f455.png)

![19](https://user-images.githubusercontent.com/49905943/201177104-8873f75e-13a0-4766-9a32-16de8113d52e.png)

![20](https://user-images.githubusercontent.com/49905943/201177115-5d6655f3-be21-4884-8a55-406f35fe7d40.png)


![18](https://user-images.githubusercontent.com/49905943/201176664-90e5b113-09e7-411b-9e32-72fc4fe26e79.png)
