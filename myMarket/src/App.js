import './App.css';
import Sidebar from './components/Sidebar';
import Slider from './components/Slider';
import ItemSlider from './components/ItemSlider';

function App() {
  const slides = [
    { id: 1, content: 'Slide 1' },
    { id: 2, content: 'Slide 2' },
    { id: 3, content: 'Slide 3' },
    { id: 4, content: 'Slide 4' },
    { id: 5, content: 'Slide 5' }
  ]                     

  return (
    <div className="App">
      <nav className="App-Nav">
        <ul>
          <li><a href="#home"> Home </a></li>
          <li><a href="#shop"> Shop </a></li>
          <li><a href="#cart"> Cart </a></li>
          <li><a href="#signin"> Sign In </a></li>
        </ul>
      </nav>
      {/* <h1>Welcome To My MarketPlace</h1> */}
      <div className='SliderContainerStyling'>
        <Slider slides={slides} />
      </div>
      <div>
        <h2 style={{ margin: '50px' }}>What's New</h2>
      </div>
      <ItemSlider />
    </div>
  );
}

export default App;
