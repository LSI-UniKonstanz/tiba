# The Interactive Behavior Analyser (Work in Progress)
A tool for the analysis of animal behavior. Created in cooperation with biologists, especially [Etienne Lein](https://www.ab.mpg.de/person/98178), from the Max Planck Institute of Animal Behavior.

## Local installation
If you want to test the functions, simply clone this repository and test everything locally. No django models are used, so you do not have to worry about database administration. The backend only consists of python funcions and a few API endpoints that enable the frontend to use their functionality. The settings.py file may also remain unchanged, but be aware that this is only for a local test environment configured, it is unsafe to use in production.

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

![Screenshot 2022-07-13 at 13-06-32 React App](https://user-images.githubusercontent.com/49905943/178720870-12eb1ef3-d8dd-4814-8413-15ead3da5f1f.png)
![Screenshot 2022-07-13 at 13-06-40 React App](https://user-images.githubusercontent.com/49905943/178720857-b7f7ba19-1aa0-41d7-a3c7-a74cd59202b4.png)
![Screenshot 2022-07-13 at 13-06-47 React App](https://user-images.githubusercontent.com/49905943/178720852-8bb7971d-a962-4e8b-ab3c-0937dc3c3992.png)
![Screenshot 2022-07-13 at 13-06-57 React App](https://user-images.githubusercontent.com/49905943/178720834-b09d5120-3bde-4120-a855-92e71957fe60.png)


## Presented Network Types

![Screenshot 2022-07-13 at 13-20-41 React App](https://user-images.githubusercontent.com/49905943/178722230-8605e0c0-2148-4290-9fcb-52b98e4270da.png)


![Screenshot 2022-07-13 at 13-14-35 React App](https://user-images.githubusercontent.com/49905943/178721964-b9c82e8c-0c2c-4613-a626-742598dada30.png)
![Screenshot 2022-07-13 at 13-16-49 React App](https://user-images.githubusercontent.com/49905943/178721957-d66363f0-1565-49a3-a45c-bb0c61cf4026.png)





![Screenshot 2022-07-13 at 13-17-13 React App](https://user-images.githubusercontent.com/49905943/178721906-64e30d0c-1ad3-4fc4-93aa-6c48261986ee.png)
![Screenshot 2022-07-13 at 13-17-29 React App](https://user-images.githubusercontent.com/49905943/178743200-c6dc3eeb-272d-4ecf-a673-a64a8f00d9a0.png)
