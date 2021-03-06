const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const db = require('./data/db');

const server= express();

server.use(express.json());

server.use(morgan('dev'));

server.get('/', (req, res) => {
	res.send('Testing....');

});


server.get('/api/projects/:id/actions', (req, res) => {
        const id = req.params.id;

        if(isNaN(id)){
        res.status(404).json({ error: "Entered Id should be a number"});
        }

        else{
	
	db('projects')
	.where('id', id)	

	.then(response => {
        if(response.length==0) res.status(404).json({ error: "The project with the specified ID does not exist." });
         else {  

                const project = response[0];
		 
		db('actions')
        	.where('project_id', id)

		.then(responseA => {
        	if(response.length==0) res.status(404).json({ error: "The project with the specified ID does not exist." });
         else {

                const actions = responseA;

                res.status(200).json({project, actions});

         }

         })

        .catch(err => {
        res.status(404).json({error: "The project with the specified ID does not exist."});
        })

        }
});
}		

});


server.get('/api/projects', (req, res)=>{

        db('projects')
        .then(response => {
                res.status(200).json(response);
        })

        .catch(err => res.status(500).json({errorMessage: "There was an error while retrieving projects from the database"}));

});


server.get('/api/actions', (req, res)=>{

        db('actions')
        .then(response => {
                res.status(200).json(response);
        })

        .catch(err => res.status(500).json({errorMessage: "There was an error while retrieving actions from the database"}));

});


server.get('/api/projects/:id', (req, res) => {
        const id = req.params.id;

        if(isNaN(id)){
        res.status(404).json({ error: "Entered Id should be a number"});
        }

        else{
        
	db('projects')
	.where('id', id)	

        .then(response => {
        if(response.length==0) res.status(404).json({ error: "The project with the specified ID does not exist." });
         else {
                 res.status(200).json(response);
         }

        })

        .catch(err => {
        res.status(404).json({error: "The project with the specified ID does not exist."});
        })

        }
});



server.get('/api/actions/:id', (req, res) => {
        const id = req.params.id;

        if(isNaN(id)){
        res.status(404).json({ error: "Entered Id should be a number"});
        }

        else{
        
        db('actions')
        .where('id', id)
        
        .then(response => {
        if(response.length==0) res.status(404).json({ error: "The action with the specified ID does not exist." });
         else {
                 res.status(200).json(response);
         }

        })

        .catch(err => {
        res.status(404).json({error: "The action with the specified ID does not exist."});
        })

        }
});


server.post('/api/projects', (req, res) => {

        const {name, description, completed} = req.body;
        const project = {name, description, completed};
        console.log(req.body);

        if (!name || !description || completed ==="") {
                res.status(400).json({message: "Please provide name, description and completed status for the project."});
        }

        else{
        db.insert(project)
	.into('projects')
        .then(ids => {
                const id= ids[0];
		const message ="Successfully added a new post";
                res.status(200).json({message, id, ...project});
        })
	
        .catch(error => {
        res.status(500).json({ message: "There was an error while saving the project to the database" });
        })
}
});


server.post('/api/actions', (req, res) => {

        if(!req.body.project_id){
	res.status(404).json({ error: "Please provide a project_id"});
	}
	
	else if(isNaN(req.body.project_id)){
        res.status(404).json({ error: "Project_id should be a number" });
        }
	


        else {

        const {project_id, notes, description, completed} = req.body;
        const action = {project_id, notes, description, completed};

        if (!project_id || !description || completed ==="" || !notes) {
                res.status(400).json({message: "Please don't leave project_id, description and completed fields empty."});
        }

        else{
        db.insert(action)
	.into('actions')
        .then(ids => {
                const id= ids[0];
                const message ="Successfully added a new action";
                res.status(200).json({message, id, ...action});
        })

        .catch(error => {
        res.status(500).json({ message: "There was an error while saving the action to the database" });
        })
}
}
});
	

server.put('/api/projects/:id', (req, res) => {
  const {name, description, completed} = req.body;

  const id =  req.params.id;
  const project = {name, description, completed}

        if (!name || !description || completed ==="") {
                res.status(400).json({message: "Please don't leave name, description and completed fields empty for the project."});
        }

        else{
        db('projects')
        .where('id', id)
        .update(project)	

        .then(response => {
                if(response===0)  res.status(404).json({ message: "The project with the specified ID does not exist." });
                else{
                        message= "Successfully updated the project with new information";
                        res.status(200).json({message, project});
                }
        })

        .catch(error => {
        res.status(500).json({ message: "Couldn't update the project" });
        })
}
});


server.put('/api/actions/:id', (req, res) => {
  const {notes, description, completed} = req.body;

  const id =  req.params.id;
  const action = {notes, description, completed}

        if (!notes || !description || completed ==="") {
                res.status(400).json({message: "Please don't leave notes, description and completed fields empty for the action."});
        }

        else{
        db('actions')
        .where('id', id)
        .update(action)

        .then(response => {
                if(response===0)  res.status(404).json({ message: "The action with the specified ID does not exist." });
                else{
                        message= "Successfully updated the action with new information";
                        res.status(200).json({message, action});
                }
        })
        
        .catch(error => {
        res.status(500).json({ message: "Couldn't update the action" });
        })
}
});


server.delete('/api/projects/:id', (req, res)=> {

        const id = req.params.id;
        console.log(id);

        if(isNaN(id)) res.status(400).json({errorMessage: "Id should be a number"});

        else{
         db('projects')
        .where('id', id)
        .del()
        .then(response => {

                if(response===1) {
                let responseObject ={};
                responseObject.message = `Successfully deleted project with id ${id}`;

                res.status(200).json(responseObject);
                }

                else res.status(404).json({ error: "The project with the specified ID does not exist."});
        })

        .catch(err => res.status(500).json(err));
        }
});


server.delete('/api/actions/:id', (req, res)=> {

        const id = req.params.id;
        console.log(id);

        if(isNaN(id)) res.status(400).json({errorMessage: "Id should be a number"});

        else{
         db('actions')
        .where('id', id)
        .del()
        .then(response => {

                if(response===1) {
                let responseObject ={};
                responseObject.message = `Successfully deleted action with id ${id}`;

                res.status(200).json(responseObject);
                }

                else res.status(404).json({ error: "The action with the specified ID does not exist."});
        })

        .catch(err => res.status(500).json(err));
        }
});




server.use((req, res) => {
  res.status(404).send("Wrong path. Please provide a correct url");
});


server.listen(4001, ()=> console.log('API listening on port 4001'));
