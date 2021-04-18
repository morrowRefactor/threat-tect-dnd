import React, { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { createProficienciesList } from './createProficienciesList';
import { createLanguagesList } from './createLanguagesList';
import '../styles/BasicInfo.css';

const basicInfoSchema = Yup.object().shape({
    chosenName: Yup.string().notRequired(),
    chosenClass: Yup.string().required('Class is required'),
    chosenRace: Yup.string().required('Race is required'),
  });

const BasicInfo = ()  => {
    const [getName, setName] = useState("");
    const [classOptions, setClasses] = useState([]);
    const [raceOptions, setRaces] = useState([]);
    const [getClass, setClassDisplay] = useState("");
    const [getRace, setRaceDisplay] = useState("");
    const [proficiencies, setProficiencies] = useState([]);
    const [languages, setLanguages] = useState([]); 

    React.useEffect(function populateState() {
        Promise.all([
            fetch('https://www.dnd5eapi.co/api/races'),
            fetch('https://www.dnd5eapi.co/api/classes')
        ])
        .then(([raceRes, classRes]) => {
            if(!raceRes.ok)
                return raceRes.json().then(e => Promise.reject(e));
            if(!classRes.ok)
                return classRes.json().then(e => Promise.reject(e));
            return Promise.all([raceRes.json(), classRes.json()]);
        })
        .then(([races, classes]) => {
            setRaces(races.results);
            setClasses(classes.results)
        })
        .catch(error => {
            console.error({error});
        });
    }, []);

    const handleSubmit = (e) => {
        const chosenClass = e.chosenClass.index;
        const chosenRace = e.chosenRace.index;

        Promise.all([
            fetch(`https://www.dnd5eapi.co/api/races/${chosenRace}`),
            fetch(`https://www.dnd5eapi.co/api/classes/${chosenClass}`)
        ])
        .then(([raceRes, classRes]) => {
            if(!raceRes.ok)
                return raceRes.json().then(e => Promise.reject(e));
            if(!classRes.ok)
                return classRes.json().then(e => Promise.reject(e));
            return Promise.all([raceRes.json(), classRes.json()]);
        })
        .then(([races, classes]) => {
            const languages = races.languages.map(lang => lang.name);
            const profs = classes.proficiencies.map(pro => pro.name);
            setLanguages(languages);
            setProficiencies(profs);
            displayRace(e.chosenRace.name);
            displayClass(e.chosenClass.name);
        })
        .catch(error => {
            console.error({error}); 
        });
    };

    const setCharacterName = e => {
        setName(e);
    }; 

    const displayRace = e => {
        setRaceDisplay(e);
    };

    const displayClass = e => {
        setClassDisplay(e);
    }

    return(
        <>
            <h2>Choose name, race & class</h2>
            <Formik>
                <Field name="chosenName" render={({field}) =>
                    <span className='p-float-label' style={{ marginTop: '1rem' }}>
                        <InputText id='chosenName' {...field}  value={getName} onChange={e => {
                            setCharacterName(e.target.value)}} style={{ width: '100%' }}/>
                        <label htmlFor='chosenName'>Enter Name</label>
                    </span>
                }/>
            </Formik>
            <Formik
                initialValues={{
                  chosenClass: '',
                  chosenRace: ''
                }}
                validationSchema={basicInfoSchema}
                onSubmit={e => handleSubmit(e)}
                render={() => (
                    <Form>
                        <div className="dropdownFormContainer">
                            <Field name="chosenRace" render={({field}) =>
                            <Dropdown
                                {...field}
                                className="dropdownFormElement dropdownFormOptions"
                                style={{ marginTop: '1rem' }}
                                optionLabel="name"
                                options={raceOptions}
                                placeholder="Select D&D Race"/>}/>
                            <ErrorMessage name='chosenRace'/>

                            <Field name="chosenClass" render={({field}) =>
                            <Dropdown
                                {...field}
                                className="dropdownFormElement dropdownFormOptions"
                                style={{ marginTop: '1rem' }}
                                optionLabel="name"
                                options={classOptions}
                                placeholder="Select D&D Class"/>}/>
                            <ErrorMessage name='chosenClass'/>
                            <Button label="Select" className="dropdownFormElement dropdownFormButton p-button-raised" style={{ marginTop: '1rem' }}/>
                        </div>
                    </Form>
                )}
            />
            <div> 
                <h3 className="NameRaceClass">{getName} {(getName && getRace && getClass) ? "the" : null} {getRace} {getClass}</h3>
            </div>
            <div>
                {createProficienciesList(proficiencies)}
            </div>
            <div>
                {createLanguagesList(languages)}
            </div>
        </>
    );
};

export default BasicInfo;
