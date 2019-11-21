# Custom Modules for Infinity Connect

With custom modules you are able to integrate powerful angular modules with our existing pexip client bundle.  You are able to create applications that can sit at the beginning or end of your application that have their own routes.  This way, you can run your custom module when users first join your webapp and also when they finish using the webapp.  You can also create custom components within the application e.g. a header that is always visible.

## Prerequisites 

You're going to need to have a basic understanding of web development, primarily Angular, Typescript and their associated tools.  You'll also need access to a test Pexip deployment whilst developing/debugging and also access to the branding portal to download a skeleton brand later on.

### Angular CLI Installation

These examples all use Angular CLI - install this globally (may require sudo) if you haven't already got it.

```sh
npm install -g @angular/cli
```

##  Simple Example

### Create the application

```sh
ng new gather-info --create-application=false
```

#### create-application flag

Setting this to false here removes all the boiler plate and additional components for a full angular application.

If you want to do full development cycle where you can view and debug the "application", then set it to true. You'll be able to run up the dummy application and work with it.

 If you're happy just working on the indivudual components and working with a test deployment to view the app, then stick with false.



Answer questions about angular routing and analytics

 - Would you like to add Angular routing? :: No
 - Which stylesheet format would you like to use? :: CSS

### Create the module library

Move into the freshly created repo for your module and create the library.

```sh
cd gather-info

npm install

ng generate library gather-info --prefix=gatherinfo
```

At this point you can now work on your application modules as in any Angular2+ app.

Module files will be located in `projects/gather-info/src/lib` from

modify the `gather-info.component.ts` and update the template with some text

### Prepare components for export into pexip app

Modify the module ts file `projects/gather-info/gather-info.module.ts` to include the `providers` to the NgModule decorator.

```typescript
  import { NgModule } from '@angular/core';
  import { GatherInfoComponent } from './gather-info.component';

  @NgModule({
    declarations: [GatherInfoComponent],
      imports: [
      ],
      providers: [{
          provide: 'plugins',
          useValue: [{
              name: 'gatherinfo-gather-info',
              component: GatherInfoComponent,
              type: 'page',
              path: 'gather',
          }],
          multi: true
      }],
      exports: [GatherInfoComponent]
  })
  export class GatherInfoModule { }
```

So lets eplain each part first. Components we want to use in pexip clients need to be included in `declarations`, `entryComponents` and `exports`, after that we need to include `providers` as I mentioned before, we will only change the `useValue` array, rest should be always the same.

Each element of `useValue` array contains an object with:

  - `name` - the `selector` of the component we can find in `my-custom-module.component.ts`.
  - `component` just imported component (you can see `import` above)
  - `type` [page|header] - represents how the component will be included in the pexip clients its either `page` which will be rendered as a separate page eg `webapp2/my-custom-welcome-page` (this needs `path` arg) or `header` (the name might change) this is component that is bascially loaded in the main component in the app so its can be used as some additional header, sticker, toolbox, toolbar, footer etc.
  - `path` - if you use `type: page` you need to provide as well path in our case `welcome` will resolve to `webapp2/welcome` so after navigating to that url we should hopefully see our `MyCustomModuleComponent`.

  - if you use `imports` in the module.ts right now we are supporting this modules `CommonModule, FormsModule, HttpClientModule` and you can as well use rxjs inside components


### Build the app

from the `projects` directory, build the project:

```sh
cd ../../..
npm run build
```

This should work

### Linking the module into the pexip app

Grab a skeleton brand from the portal

 - customisations --> new
 - dashboard --> build with just your customisation in the dropdown

Save the branding.zip generated.

Unpack the zip from above and modify the `manifest.json` in the unpacked skeleton to include a customModules section:

```json
  "customModules": [
      {
        "name": "GatherInfoModule",
        "srcURL": "custom_configuration/modules/gather-info.umd.min.js"
      }
  ]
```

create a `modules` directory in the root and copy in the umd minified js

```sh
cd webapp2
mkdir modules
cd modules
cp ../../gather-info/dist/gather-info/bundles/gather-info.umd.min.js .
```

Create the zip and upload to mgmt portal

```sh
zip -r branding_with_module.zip webapp2
```

Once the configuration has replicated you're can test your custom route and module at the path `/webapp2/gather` - congratulations.

Currently communication with the webapp is done through [PluginAPI]( https://docs.pexip.com/end_user/guide_for_admins/plugins.htm) so for instance if we want to show the invitation to the meeting card we just need to call `window.PEX.pluginAPI.navigateToInvitationCard(conferenceName: string, pin?: number)`
