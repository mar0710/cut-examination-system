import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import { createConnection } from 'typeorm';
import { Question } from './question.schema';
import { Student } from './student.schema';
import { Thesis } from './thesis.schema';
import { Subject } from './subject.schema';
import { Semester } from './semester.schema';
import { ProgressRecord } from './progress-record.schema';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

async function createWindow(): Promise<BrowserWindow> {

  const connection = await createConnection({
    type: 'sqlite',
    synchronize: true,
    logging: true,
    logger: 'simple-console',
    database: './database.sqlite',
    entities: [Question, Student, Thesis, Subject, Semester, ProgressRecord],
  });

  const questionRepo = connection.getRepository(Question);
  const studentRepo = connection.getRepository(Student);
  const thesisRepo = connection.getRepository(Thesis);
  const subjectRepo = connection.getRepository(Subject);
  const semesterRepo = connection.getRepository(Semester);
  const progressRecordRepo = connection.getRepository(ProgressRecord);

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
  });
  win.maximize();
  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    win.loadURL(url.format({
      pathname: path.join(__dirname, pathIndex),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });



  ipcMain.on('get-questions', async (event: any) => {
    try {
      event.returnValue = await questionRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('get-question', async (event: any, _id: number) => {
    try {
        const temp = await questionRepo.findOneBy({id: _id});
        const question = await questionRepo.create(temp);
        event.returnValue = question
      }
    catch (err) {
      throw err;
    }
  });


  ipcMain.on('add-questions', async (event: any, ...args: Question[]) => {
    try {
      for (let singleQuestion of args) {
        const question = await questionRepo.create(singleQuestion);
        await questionRepo.save(question);
      }
      event.returnValue = await questionRepo.find();
    } catch (err) {
      throw err;
    }
  });


  ipcMain.on('delete-questions', async (event: any) => {
    try {
      await questionRepo.clear();
      event.returnValue = await questionRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('delete-question', async (event: any, id: number) => {
    try {
      const temp = await questionRepo.findOneBy({id: id})
      const question = await questionRepo.create(temp);
      await questionRepo.remove(question);
      event.returnValue = await questionRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('add-student', async (event: any, _student: Student) => {
    try {
        const student = await studentRepo.create(_student);
        await studentRepo.save(student);
        event.returnValue = student.id
      }
    catch (err) {
      throw err;
    }
  });



  ipcMain.on('get-students', async (event: any) => {
    try {
      event.returnValue = await studentRepo.find();
    } catch (err) {
      throw err;
    }
  });


  ipcMain.on('get-student', async (event: any, _albumNum: number) => {
    try {
        const temp = await studentRepo.findOneBy({albumNum: _albumNum});
        const student = await studentRepo.create(temp);
        event.returnValue = student
      }
    catch (err) {
      throw err;
    }
  });



  ipcMain.on('delete-students', async (event: any) => {
    try {
      await studentRepo.clear();
      event.returnValue = await studentRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('add-thesis', async (event: any, _thesis: Thesis) => {
    try {
        const thesis = await thesisRepo.create(_thesis);
        await thesisRepo.save(thesis);
        event.returnValue = thesis.id
      }
    catch (err) {
      throw err;
    }
  });


  ipcMain.on('get-thesis', async (event: any, _id: number) => {
    try {
        const temp = await thesisRepo.findOneBy({id: _id});
        const thesis = await thesisRepo.create(temp);
        event.returnValue = thesis
      }
    catch (err) {
      throw err;
    }
  });


  ipcMain.on('delete-theses', async (event: any) => {
    try {
      await thesisRepo.clear();
      event.returnValue = await thesisRepo.find();
    } catch (err) {
      throw err;
    }
  });



  ipcMain.on('add-subject', async (event: any, _subject: Subject) => {
    try {
        const subject = await subjectRepo.create(_subject);
        await subjectRepo.save(subject);
        event.returnValue = subject.id
      }
    catch (err) {
      throw err;
    }
  });



  ipcMain.on('get-subject', async (event: any, _id: number) => {
    try {
        const temp = await subjectRepo.findOneBy({id: _id});
        const subject = await subjectRepo.create(temp);
        event.returnValue = subject
      }
    catch (err) {
      throw err;
    }
  });


  ipcMain.on('delete-subjects', async (event: any) => {
    try {
      await subjectRepo.clear();
      event.returnValue = await subjectRepo.find();
    } catch (err) {
      throw err;
    }
  });




  ipcMain.on('add-semester', async (event: any, _semester: Semester) => {
    try {
        const semester = await semesterRepo.create(_semester);
        await semesterRepo.save(semester);
        event.returnValue = semester.id
      }
    catch (err) {
      throw err;
    }
  });


  ipcMain.on('get-semester', async (event: any, _id: number) => {
    try {
        const temp = await semesterRepo.findOneBy({id: _id});
        const semester = await semesterRepo.create(temp);
        event.returnValue = semester
      }
    catch (err) {
      throw err;
    }
  });

  ipcMain.on('delete-semesters', async (event: any) => {
    try {
      await semesterRepo.clear();
      event.returnValue = await semesterRepo.find();
    } catch (err) {
      throw err;
    }
  });


  ipcMain.on('add-progressRecord', async (event: any, _progressRecord: ProgressRecord) => {
    try {
        const progressRecord = await progressRecordRepo.create(_progressRecord);
        await progressRecordRepo.save(progressRecord);
        event.returnValue = progressRecord.id
      }
    catch (err) {
      throw err;
    }
  });



  ipcMain.on('get-progressRecord', async (event: any, _studentId: number) => {
    try {
        const temp = await progressRecordRepo.findOneBy({student: _studentId});
        const progressRecord = await progressRecordRepo.create(temp);
        event.returnValue = progressRecord
      }
    catch (err) {
      throw err;
    }
  });


  ipcMain.on('delete-progressRecords', async (event: any) => {
    try {
      await progressRecordRepo.clear();
      event.returnValue = await progressRecordRepo.find();
    } catch (err) {
      throw err;
    }
  });


  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
