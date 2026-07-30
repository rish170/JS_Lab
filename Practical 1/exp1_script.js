function greet(){
    alert("Welcome to Javascript Programming!");

    console.table([
        {
            Name: "Sample User",
            Course: "JavaScript"
        }
    ]);

    console.time("Execution");
    console.timeEnd("Execution");
}