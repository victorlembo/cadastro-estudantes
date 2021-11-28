import { browser, element, by, ElementFinder, ElementArrayFinder } from 'protractor';

const expectedH1 = 'Tour of Students';
const expectedTitle = `${expectedH1}`;
const targetStudent = { id: 15, name: 'Magneta' };
const targetStudentDashboardIndex = 3;
const nameSuffix = 'X';
const newStudentName = targetStudent.name + nameSuffix;

class Student {
  constructor(public id: number, public name: string) {}

  // Factory methods

  // Student from string formatted as '<id> <name>'.
  static fromString(s: string): Student {
    return new Student(
      +s.substr(0, s.indexOf(' ')),
      s.substr(s.indexOf(' ') + 1),
    );
  }

  // Student from student list <li> element.
  static async fromLi(li: ElementFinder): Promise<Student> {
    const stringsFromA = await li.all(by.css('a')).getText();
    const strings = stringsFromA[0].split(' ');
    return { id: +strings[0], name: strings[1] };
  }

  // Student id and name from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<Student> {
    // Get student id from the first <div>
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
      topStudents: element.all(by.css('app-root app-dashboard > div a')),

      appStudentsHref: navElts.get(1),
      appStudents: element(by.css('app-root app-students')),
      allStudents: element.all(by.css('app-root app-students li')),
      selectedStudentSubview: element(by.css('app-root app-students > div:last-child')),

      studentDetail: element(by.css('app-root app-student-detail > div')),

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

    const expectedViewNames = ['Dashboard', 'Students'];
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

    it('has top students', async () => {
      const page = getPageElts();
      expect(await page.topStudents.count()).toEqual(4);
    });

    it(`selects and routes to ${targetStudent.name} details`, dashboardSelectTargetStudent);

    it(`updates student name (${newStudentName}) in details view`, updateStudentNameInDetailView);

    it(`cancels and shows ${targetStudent.name} in Dashboard`, async () => {
      await element(by.buttonText('go back')).click();
      await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      const targetStudentElt = getPageElts().topStudents.get(targetStudentDashboardIndex);
      expect(await targetStudentElt.getText()).toEqual(targetStudent.name);
    });

    it(`selects and routes to ${targetStudent.name} details`, dashboardSelectTargetStudent);

    it(`updates student name (${newStudentName}) in details view`, updateStudentNameInDetailView);

    it(`saves and shows ${newStudentName} in Dashboard`, async () => {
      await element(by.buttonText('save')).click();
      await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      const targetStudentElt = getPageElts().topStudents.get(targetStudentDashboardIndex);
      expect(await targetStudentElt.getText()).toEqual(newStudentName);
    });

  });

  describe('Students tests', () => {

    beforeAll(() => browser.get(''));

    it('can switch to Students view', async () => {
      await getPageElts().appStudentsHref.click();
      const page = getPageElts();
      expect(await page.appStudents.isPresent()).toBeTruthy();
      expect(await page.allStudents.count()).toEqual(10, 'number of students');
    });

    it('can route to student details', async () => {
      await getStudentLiEltById(targetStudent.id).click();

      const page = getPageElts();
      expect(await page.studentDetail.isPresent()).toBeTruthy('shows student detail');
      const student = await Student.fromDetail(page.studentDetail);
      expect(student.id).toEqual(targetStudent.id);
      expect(student.name).toEqual(targetStudent.name.toUpperCase());
    });

    it(`updates student name (${newStudentName}) in details view`, updateStudentNameInDetailView);

    it(`shows ${newStudentName} in Students list`, async () => {
      await element(by.buttonText('save')).click();
      await browser.waitForAngular();
      const expectedText = `${targetStudent.id} ${newStudentName}`;
      expect(await getStudentAEltById(targetStudent.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${newStudentName} from Students list`, async () => {
      const studentesBefore = await toStudentArray(getPageElts().allStudents);
      const li = getStudentLiEltById(targetStudent.id);
      await li.element(by.buttonText('x')).click();

      const page = getPageElts();
      expect(await page.appStudents.isPresent()).toBeTruthy();
      expect(await page.allStudents.count()).toEqual(9, 'number of students');
      const studentesAfter = await toStudentArray(page.allStudents);
      // console.log(await Student.fromLi(page.allStudents[0]));
      const expectedStudents =  studentesBefore.filter(h => h.name !== newStudentName);
      expect(studentesAfter).toEqual(expectedStudents);
      // expect(page.selectedStudentSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${targetStudent.name}`, async () => {
      const addedStudentName = 'Alice';
      const studentesBefore = await toStudentArray(getPageElts().allStudents);
      const numStudents = studentesBefore.length;

      await element(by.css('input')).sendKeys(addedStudentName);
      await element(by.buttonText('Add student')).click();

      const page = getPageElts();
      const studentesAfter = await toStudentArray(page.allStudents);
      expect(studentesAfter.length).toEqual(numStudents + 1, 'number of students');

      expect(studentesAfter.slice(0, numStudents)).toEqual(studentesBefore, 'Old students are still there');

      const maxId = studentesBefore[studentesBefore.length - 1].id;
      expect(studentesAfter[numStudents]).toEqual({id: maxId + 1, name: addedStudentName});
    });

    it('displays correctly styled buttons', async () => {
      const buttons = await element.all(by.buttonText('x'));

      for (const button of buttons) {
        // Inherited styles from styles.css
        expect(await button.getCssValue('font-family')).toBe('Arial, Helvetica, sans-serif');
        expect(await button.getCssValue('border')).toContain('none');
        expect(await button.getCssValue('padding')).toBe('1px 10px 3px');
        expect(await button.getCssValue('border-radius')).toBe('4px');
        // Styles defined in students.component.css
        expect(await button.getCssValue('left')).toBe('210px');
        expect(await button.getCssValue('top')).toBe('5px');
      }

      const addButton = element(by.buttonText('Add student'));
      // Inherited styles from styles.css
      expect(await addButton.getCssValue('font-family')).toBe('Arial, Helvetica, sans-serif');
      expect(await addButton.getCssValue('border')).toContain('none');
      expect(await addButton.getCssValue('padding')).toBe('8px 24px');
      expect(await addButton.getCssValue('border-radius')).toBe('4px');
    });

  });

  describe('Progressive student search', () => {

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

    it(`continues search with 'e' and gets ${targetStudent.name}`, async () => {
      await getPageElts().searchBox.sendKeys('n');
      await browser.sleep(1000);
      const page = getPageElts();
      expect(await page.searchResults.count()).toBe(1);
      const student = page.searchResults.get(0);
      expect(await student.getText()).toEqual(targetStudent.name);
    });

    it(`navigates to ${targetStudent.name} details view`, async () => {
      const student = getPageElts().searchResults.get(0);
      expect(await student.getText()).toEqual(targetStudent.name);
      await student.click();

      const page = getPageElts();
      expect(await page.studentDetail.isPresent()).toBeTruthy('shows student detail');
      const student2 = await Student.fromDetail(page.studentDetail);
      expect(student2.id).toEqual(targetStudent.id);
      expect(student2.name).toEqual(targetStudent.name.toUpperCase());
    });
  });

  async function dashboardSelectTargetStudent() {
    const targetStudentElt = getPageElts().topStudents.get(targetStudentDashboardIndex);
    expect(await targetStudentElt.getText()).toEqual(targetStudent.name);
    await targetStudentElt.click();
    await browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

    const page = getPageElts();
    expect(await page.studentDetail.isPresent()).toBeTruthy('shows student detail');
    const student = await Student.fromDetail(page.studentDetail);
    expect(student.id).toEqual(targetStudent.id);
    expect(student.name).toEqual(targetStudent.name.toUpperCase());
  }

  async function updateStudentNameInDetailView() {
    // Assumes that the current view is the student details view.
    await addToStudentName(nameSuffix);

    const page = getPageElts();
    const student = await Student.fromDetail(page.studentDetail);
    expect(student.id).toEqual(targetStudent.id);
    expect(student.name).toEqual(newStudentName.toUpperCase());
  }

});

async function addToStudentName(text: string): Promise<void> {
  const input = element(by.css('input'));
  await input.sendKeys(text);
}

async function expectHeading(hLevel: number, expectedText: string): Promise<void> {
  const hTag = `h${hLevel}`;
  const hText = await element(by.css(hTag)).getText();
  expect(hText).toEqual(expectedText, hTag);
}

function getStudentAEltById(id: number): ElementFinder {
  const spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('..'));
}

function getStudentLiEltById(id: number): ElementFinder {
  const spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('../..'));
}

async function toStudentArray(allStudents: ElementArrayFinder): Promise<Student[]> {
  return allStudents.map(student => Student.fromLi(student!));
}
