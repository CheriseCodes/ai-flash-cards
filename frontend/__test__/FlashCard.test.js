import renderer from 'react-test-renderer';
import FlashCard from '../src/components/FlashCard.js';

it("is non null", () => {
    const component = renderer.create(<FlashCard cardData={{id:"abcd123"}} userId="default"></FlashCard>);
    let tree = component.toJSON()
    console.log(tree);
});