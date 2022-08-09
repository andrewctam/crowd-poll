function App() {

  const test = async () => {
    const url = ""
    const message = await fetch(url)
    .then((response) => response.json())

    console.log(message)
  }
  return (
    <div className="App">
      <button className = "btn e" onClick = {test}>Test</button>       
    </div>
  );
}

export default App;
