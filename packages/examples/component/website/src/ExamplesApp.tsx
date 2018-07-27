import * as React from 'react';
import * as project from '@tradie/project-info';

console.log('project:', project);

function ExampleList(props: {packages: any[]}) {
  const {packages} = props;
  return (
    <>
      {packages.map(pkg => {
        const {name, examples} = pkg;
        return (
          <React.Fragment key={pkg.name}>
            <p>{name}</p>
            {examples.map(example => {
              return (
                <React.Fragment key={example.name}>
                  <p> &mdash; {example.name}</p>
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}

function ExampleDemo(props: {example: any; module: any}) {
  const {example, module} = props;
  return (
    <>
      <h1>{example.name}</h1>
      {module && module.default ? <module.default/> : null}
    </>
  );
}

export interface ExampleAppProps {
}

export interface ExampleAppState {
  selectedExample?: any;
  selectedModule?: any;
}

export default class ExampleApp extends React.Component<ExampleAppProps, ExampleAppState> {

  state: ExampleAppState = {
    selectedExample: project.root.examples[0],
    selectedModule: undefined
  };

  async componentDidMount() {
    const module = await this.state.selectedExample.load();
    this.setState({selectedModule: module})
  }

  render() {
    const {selectedExample, selectedModule} = this.state;
    return (
      <div>
        <ExampleList packages={project.packages}/>
        <ExampleDemo example={selectedExample} module={selectedModule}/>
      </div>
    );
  }
}
