
import express, { Request, Response } from "express";

interface IUser{
    id: number;
    nome: string; 
    email: string;
    isActive: boolean;

}

const app = express();

const port: number = 3000;

app.use(express.json());

const users: IUser[] = [
   {
       id: 1,
       nome: "Ana",
       email: "ana@gmail.com",
       isActive: true
   },
   {
       id: 2,
       nome: "Bruno",
       email: "bruno@gmail.com",
       isActive: true,
   }

];

// validação 
// function isValidUser 
// Verifica se o usuário possui todas as propriedades com os tipos corretos.
function isValidUser(user: IUser): boolean {
  return (
    typeof user.id === "number" &&
    typeof user.nome === "string" &&
    typeof user.email === "string" &&
    typeof user.isActive === "boolean"
  );
}

app.get("/users", (request: Request, response: Response): void => {
    response.status(200).json(users);
})

app.get("/users/:id", (request: Request, response: Response): void => {
    const id = Number(request.params.id);
    const user = users.find((currentUser) => currentUser.id === id);

    if (user == undefined) {
        response.status(404).json({message: "Usuário não encontrado"});
        return;
    }

    response.status(200).json(user);
}, );


app.post("/users", (request: Request, response: Response): void => {
    const newUser: IUser = request.body as IUser;

    if(!isValidUser(newUser)) {
        response.status(400).json({message: "Dados inválidos"});
        return;
    }

    users.push(newUser);
    response.status(201).json(newUser);

},);


app.put("/users/:id", (request: Request, response: Response): void => {
    const id = Number(request.params.id);
    const userIndex = users.findIndex((user) => user.id === id);
    
    if(userIndex === -1) {
        response.status(404).json({message: "Usuuário nao encontrado"});
        return;
    }

    const updateData: IUser = request.body as IUser;

    if(!isValidUser(updateData)){
        response.status(400).json({message: "Dados invalidos"});
        return;
    }
    
    const updateUser: IUser = {... updateData, id};
    users[userIndex] = updateUser;

    response.status(200).json(updateUser);

},);


app.delete("/users/:id", (request: Request, response: Response): void => {
    const id = Number(request.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    if(userIndex == -1){
        response.status(400).json({message: "Usuário nao encontrado"});
        return;
    }

    users.splice(userIndex, 1);
    response.status(200).json({message: "Usuário removido com sucesso"})


}, );


app.listen(port, (): void => {
    console.log(`Servidor iniciado em http://localhost:${port}`);
} )