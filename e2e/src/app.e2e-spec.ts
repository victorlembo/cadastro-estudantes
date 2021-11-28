import { browser, element, by, ElementFinder, ElementArrayFinder } from 'protractor';

const expectedH1 = 'Tour of Alunos';
const expectedTitle = `${expectedH1}`;
const targetAluno = { id: 15, name: 'Magneta' };
const targetAlunoDashboardIndex = 3;
const nameSuffix = 'X';
const newAlunoName = targetAluno.name + nameSuffix;

class Aluno {
  constructor(public id: number, public name: string) {}

  // Factory methods

  // Aluno from string formatted as '<id> <name>'.
  static fromString(s: string): Aluno {
    return new Aluno(
      +s.substr(0, s.indexOf(' ')),
      s.substr(s.indexOf(' ') + 1),
    );
  }

  // Aluno from aluno list <li> element.
  static async fromLi(li: ElementFinder): Promise<Aluno> {
    const stringsFromA = await li.all(by.css('a')).getText();
    const strings = stringsFromA[0].split(' ');
    return { id: +strings[0], name: strings[1] };
  }

  // Aluno id and name from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<Aluno> {
    // Get aluno id from the first <div>
    const id = await detail.all(by.css('div')).first().getText();
    // Get name from the h2
    const name = await detail.element(by.css('h2')).getText();
    return {
      id: +id.substr(id.indexOf(' ') + 1),
      name: name.substr(0, name.lastIndexOf(' '))
    };
  }
}

describe('Tutorial part 6', () => {

  beforeAll(() => browser.get(''));

  function getPageElts() {
    const navElts = element.all(by.css('app-root nav a'));

    return {
      navElts,

      appDashboardHref: navElts.get(0),
      appDashboard: element(by.css('app-root app-dashboard')),
      topAlunos: element.all(by.css('app-root app-dashboard > div a')),

      appAlunosHref: navElts.get(1),
      appAlunos: element(by.css('app-root app-alunos')),
      allAlunos: element.all(by.css('app-root app-alunos li')),
      selectedAlunoSubview: element(by.css('app-root app-alunos > div:last-child')),

      alunoDetail: element(by.css('app-root app-aluno-detail > div')),

      searchBox: element(by.css('#search-box')),
      searchResults: element.all(by.css('.search-result li'))
    };
  }

  describe('Initial page', () => {

    it(`has title '${expectedTitle}'`, async () => {
      expect(await browser.getTitle()).toEqual(expectedTitle);
    });

    it(`has h1 '${expectedH1}'`, async () => {
      await expectHeading(1, expectedH1);
    });

    const expectedViewNames = ['Dashboard', 'Alunos'];
    it(`has views ${expectedViewNames}`, async () => {
      const viewNames = await getPageElts().navElts.map(el => el!.getText());
      expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', async () => {
      const page = getPageElts();
      expect(await page.appDashboard.isPresent()).toBeTruthy();
    });

  });

  describe('Dashboard tests', () => {

    beforeAll(() => browser.get(''));

    it('has top alunos', async () => {
      const page = getPageElts();
      expect(await page.topAlunos.count()).toEqual(4);
    });

    it(`selects and routes to ${targetAluno.name} details`, dashboardSelectTargetAluno);

    it(`updates aluno name (${newAlunoName}) in details view`, updateAlunoNameInDetailView);

    it(`cancels and shows ${targetAluno.name} in Dashboard`, async () => {
      await element(by.buttonText('go back')).click();
      await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      const targetAlunoElt = getPageElts().topAlunos.get(targetAlunoDashboardIndex);
      expect(await targetAlunoElt.getText()).toEqual(targetAluno.name);
    });

    it(`selects and routes to ${targetAluno.name} details`, dashboardSelectTargetAluno);

    it(`updates aluno name (${newAlunoName}) in details view`, updateAlunoNameInDetailView);

    it(`saves and shows ${newAlunoName} in Dashboard`, async () => {
      await element(by.buttonText('save')).click();
      await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      const targetAlunoElt = getPageElts().topAlunos.get(targetAlunoDashboardIndex);
      expect(await targetAlunoElt.getText()).toEqual(newAlunoName);
    });

  });

  describe('Alunos tests', () => {

    beforeAll(() => browser.get(''));

    it('can switch to Alunos view', async () => {
      await getPageElts().appAlunosHref.click();
      const page = getPageElts();
      expect(await page.appAlunos.isPresent()).toBeTruthy();
      expect(await page.allAlunos.count()).toEqual(10, 'number of alunos');
    });

    it('can route to aluno details', async () => {
      await getAlunoLiEltById(targetAluno.id).click();

      const page = getPageElts();
      expect(await page.alunoDetail.isPresent()).toBeTruthy('shows aluno detail');
      const aluno = await Aluno.fromDetail(page.alunoDetail);
      expect(aluno.id).toEqual(targetAluno.id);
      expect(aluno.name).toEqual(targetAluno.name.toUpperCase());
    });

    it(`updates aluno name (${newAlunoName}) in details view`, updateAlunoNameInDetailView);

    it(`shows ${newAlunoName} in Alunos list`, async () => {
      await element(by.buttonText('save')).click();
      await browser.waitForAngular();
      const expectedText = `${targetAluno.id} ${newAlunoName}`;
      expect(await getAlunoAEltById(targetAluno.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${newAlunoName} from Alunos list`, async () => {
      const alunoesBefore = await toAlunoArray(getPageElts().allAlunos);
      const li = getAlunoLiEltById(targetAluno.id);
      await li.element(by.buttonText('x')).click();

      const page = getPageElts();
      expect(await page.appAlunos.isPresent()).toBeTruthy();
      expect(await page.allAlunos.count()).toEqual(9, 'number of alunos');
      const alunoesAfter = await toAlunoArray(page.allAlunos);
      // console.log(await Aluno.fromLi(page.allAlunos[0]));
      const expectedAlunos =  alunoesBefore.filter(h => h.name !== newAlunoName);
      expect(alunoesAfter).toEqual(expectedAlunos);
      // expect(page.selectedAlunoSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${targetAluno.name}`, async () => {
      const addedAlunoName = 'Alice';
      const alunoesBefore = await toAlunoArray(getPageElts().allAlunos);
      const numAlunos = alunoesBefore.length;

      await element(by.css('input')).sendKeys(addedAlunoName);
      await element(by.buttonText('Add aluno')).click();

      const page = getPageElts();
      const alunoesAfter = await toAlunoArray(page.allAlunos);
      expect(alunoesAfter.length).toEqual(numAlunos + 1, 'number of alunos');

      expect(alunoesAfter.slice(0, numAlunos)).toEqual(alunoesBefore, 'Old alunos are still there');

      const maxId = alunoesBefore[alunoesBefore.length - 1].id;
      expect(alunoesAfter[numAlunos]).toEqual({id: maxId + 1, name: addedAlunoName});
    });

    it('displays correctly styled buttons', async () => {
      const buttons = await element.all(by.buttonText('x'));

      for (const button of buttons) {
        // Inherited styles from styles.css
        expect(await button.getCssValue('font-family')).toBe('Arial, Helvetica, sans-serif');
        expect(await button.getCssValue('border')).toContain('none');
        expect(await button.getCssValue('padding')).toBe('1px 10px 3px');
        expect(await button.getCssValue('border-radius')).toBe('4px');
        // Styles defined in alunos.component.css
        expect(await button.getCssValue('left')).toBe('210px');
        expect(await button.getCssValue('top')).toBe('5px');
      }

      const addButton = element(by.buttonText('Add aluno'));
      // Inherited styles from styles.css
      expect(await addButton.getCssValue('font-family')).toBe('Arial, Helvetica, sans-serif');
      expect(await addButton.getCssValue('border')).toContain('none');
      expect(await addButton.getCssValue('padding')).toBe('8px 24px');
      expect(await addButton.getCssValue('border-radius')).toBe('4px');
    });

  });

  describe('Progressive aluno search', () => {

    beforeAll(() => browser.get(''));

    it(`searches for 'Ma'`, async () => {
      await getPageElts().searchBox.sendKeys('Ma');
      await browser.sleep(1000);

      expect(await getPageElts().searchResults.count()).toBe(4);
    });

    it(`continues search with 'g'`, async () => {
      await getPageElts().searchBox.sendKeys('g');
      await browser.sleep(1000);
      expect(await getPageElts().searchResults.count()).toBe(2);
    });

    it(`continues search with 'e' and gets ${targetAluno.name}`, async () => {
      await getPageElts().searchBox.sendKeys('n');
      await browser.sleep(1000);
      const page = getPageElts();
      expect(await page.searchResults.count()).toBe(1);
      const aluno = page.searchResults.get(0);
      expect(await aluno.getText()).toEqual(targetAluno.name);
    });

    it(`navigates to ${targetAluno.name} details view`, async () => {
      const aluno = getPageElts().searchResults.get(0);
      expect(await aluno.getText()).toEqual(targetAluno.name);
      await aluno.click();

      const page = getPageElts();
      expect(await page.alunoDetail.isPresent()).toBeTruthy('shows aluno detail');
      const aluno2 = await Aluno.fromDetail(page.alunoDetail);
      expect(aluno2.id).toEqual(targetAluno.id);
      expect(aluno2.name).toEqual(targetAluno.name.toUpperCase());
    });
  });

  async function dashboardSelectTargetAluno() {
    const targetAlunoElt = getPageElts().topAlunos.get(targetAlunoDashboardIndex);
    expect(await targetAlunoElt.getText()).toEqual(targetAluno.name);
    await targetAlunoElt.click();
    await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

    const page = getPageElts();
    expect(await page.alunoDetail.isPresent()).toBeTruthy('shows aluno detail');
    const aluno = await Aluno.fromDetail(page.alunoDetail);
    expect(aluno.id).toEqual(targetAluno.id);
    expect(aluno.name).toEqual(targetAluno.name.toUpperCase());
  }

  async function updateAlunoNameInDetailView() {
    // Assumes that the current view is the aluno details view.
    await addToAlunoName(nameSuffix);

    const page = getPageElts();
    const aluno = await Aluno.fromDetail(page.alunoDetail);
    expect(aluno.id).toEqual(targetAluno.id);
    expect(aluno.name).toEqual(newAlunoName.toUpperCase());
  }

});

async function addToAlunoName(text: string): Promise<void> {
  const input = element(by.css('input'));
  await input.sendKeys(text);
}

async function expectHeading(hLevel: number, expectedText: string): Promise<void> {
  const hTag = `h${hLevel}`;
  const hText = await element(by.css(hTag)).getText();
  expect(hText).toEqual(expectedText, hTag);
}

function getAlunoAEltById(id: number): ElementFinder {
  const spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('..'));
}

function getAlunoLiEltById(id: number): ElementFinder {
  const spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('../..'));
}

async function toAlunoArray(allAlunos: ElementArrayFinder): Promise<Aluno[]> {
  return allAlunos.map(aluno => Aluno.fromLi(aluno!));
}
