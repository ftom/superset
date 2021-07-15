/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { FormEvent, useState, Dispatch, SetStateAction } from 'react';
import { SupersetTheme, JsonObject, t } from '@superset-ui/core';
import { InputProps } from 'antd/lib/input';
import { Input, Switch, Select, Button } from 'src/common/components';
import InfoTooltip from 'src/components/InfoTooltip';
import ValidatedInput from 'src/components/Form/LabeledErrorBoundInput';
import FormLabel from 'src/components/Form/FormLabel';
import { DeleteFilled, CloseOutlined } from '@ant-design/icons';
import {
  formScrollableStyles,
  validatedFormStyles,
  CredentialInfoForm,
  toggleStyle,
  infoTooltip,
  StyledFooterButton,
} from './styles';
import { DatabaseForm, DatabaseObject } from '../types';

enum CredentialInfoOptions {
  jsonUpload,
  copyPaste,
}

export const FormFieldOrder = [
  'host',
  'port',
  'database',
  'username',
  'password',
  'database_name',
  'credentials_info',
  'table_catalog',
  'query',
  'encryption',
];

interface FieldPropTypes {
  required: boolean;
  hasTooltip?: boolean;
  tooltipText?: (valuse: any) => string;
  onParametersChange: (value: any) => string;
  onParametersUploadFileChange: (value: any) => string;
  changeMethods: { onParametersChange: (value: any) => string } & {
    onChange: (value: any) => string;
  } & { onParametersUploadFileChange: (value: any) => string };
  validationErrors: JsonObject | null;
  getValidation: () => void;
  db?: DatabaseObject;
  isEditMode?: boolean;
  sslForced?: boolean;
  defaultDBName?: string;
  editNewDb?: boolean;
  setPublic: Dispatch<SetStateAction<boolean>>;
  isPublic?: boolean;
}

const CredentialsInfo = ({
  changeMethods,
  isEditMode,
  db,
  editNewDb,
  isPublic,
}: FieldPropTypes) => {
  const [uploadOption, setUploadOption] = useState<number>(
    CredentialInfoOptions.jsonUpload.valueOf(),
  );
  const [fileToUpload, setFileToUpload] = useState<string | null | undefined>(
    null,
  );
  return (
    <CredentialInfoForm>
      {!isEditMode && db?.engine === 'bigquery' && (
        <>
          <FormLabel required>
            {t('How do you want to enter service account credentials?')}
          </FormLabel>
          <Select
            defaultValue={uploadOption}
            style={{ width: '100%' }}
            onChange={option => setUploadOption(option)}
          >
            <Select.Option value={CredentialInfoOptions.jsonUpload}>
              {t('Upload JSON file')}
            </Select.Option>

            <Select.Option value={CredentialInfoOptions.copyPaste}>
              {t('Copy and Paste JSON credentials')}
            </Select.Option>
          </Select>
        </>
      )}
      {uploadOption === CredentialInfoOptions.copyPaste ||
      isEditMode ||
      editNewDb ||
      (db?.engine === 'gsheets' && !isPublic) ? (
        <div className="input-container">
          <FormLabel required>{t('Service Account Information')}</FormLabel>
          <textarea
            className="input-form"
            name="credentials_info"
            value={db?.parameters?.credentials_info}
            onChange={changeMethods.onParametersChange}
            placeholder="Paste content of service credentials JSON file here"
          />
          <span className="label-paste">
            {t(
              'Copy and paste the entire service account .json file here to enable connection',
            )}
          </span>
        </div>
      ) : (
        db?.engine === 'bigquery' && (
          <div
            className="input-container"
            css={(theme: SupersetTheme) => infoTooltip(theme)}
          >
            <div css={{ display: 'flex', alignItems: 'center' }}>
              <FormLabel required>{t('Upload Credentials')}</FormLabel>
              <InfoTooltip
                tooltip={t(
                  'Use the JSON file you automatically downloaded when creating your service account in Google BigQuery.',
                )}
                viewBox="0 0 24 24"
              />
            </div>
            )
            {!fileToUpload && (
              <Button
                className="input-upload-btn"
                onClick={() =>
                  document?.getElementById('selectedFile')?.click()
                }
              >
                {t('Choose File')}
              </Button>
            )}
            {fileToUpload && (
              <div className="input-upload-current">
                {fileToUpload}
                <DeleteFilled
                  onClick={() => {
                    setFileToUpload(null);
                    changeMethods.onParametersChange({
                      target: {
                        name: 'credentials_info',
                        value: '',
                      },
                    });
                  }}
                />
              </div>
            )}
            <input
              id="selectedFile"
              className="input-upload"
              type="file"
              onChange={async event => {
                let file;
                if (event.target.files) {
                  file = event.target.files[0];
                }
                setFileToUpload(file?.name);
                changeMethods.onParametersChange({
                  target: {
                    type: null,
                    name: 'credentials_info',
                    value: await file?.text(),
                    checked: false,
                  },
                });
                (document.getElementById(
                  'selectedFile',
                ) as HTMLInputElement).value = null as any;
              }}
            />
          </div>
        )
      )}
    </CredentialInfoForm>
  );
};

const TableCatalog = ({
  required,
  changeMethods,
  isEditMode,
  getValidation,
  db,
  editNewDb,
  validationErrors,
}: FieldPropTypes) => {
  const [tableCatalog, setTableCatalog] = useState<Record<string, string>>([
    {},
  ]);
  return (
    <div>
      {console.log(tableCatalog)}
      <>
        {tableCatalog.map(sheet => (
          <>
            <Input
              name="table-catalog-name-1"
              placeholder="Enter create a name for this sheet"
              onChange={e => {
                console.log(e.target.value);
                setTableCatalog([{ name: `table-catalog-${e.target.value}` }]);
              }}
            />
            {/* <CloseOutlined
              onClick={() => {
                const index = tableCatalog.indexOf(sheet);
                console.log(index)
                if (index > -1) {
                  tableCatalog.splice(index, 1);
                  console.log(tableCatalog);
                  setTableCatalog(tableCatalog);
                }
              }}
            /> */}
            <ValidatedInput
              name={sheet.name}
              type="gsheet"
              required={required}
              validationMethods={{ onBlur: getValidation }}
              errorMessage={validationErrors?.table_catalog}
              placeholder="Paste the shareable Google Sheet URL here"
              onChange={changeMethods.onParametersChange}
              onPaste={e => {
                changeMethods.onParametersChange({
                  target: {
                    name: 'table-catalog-value-1',
                    value: e.clipboardData.getData('Text'),
                  },
                });
              }}
            />
          </>
        ))}
        <StyledFooterButton
          onClick={() => {
            console.log('add button');
            setTableCatalog([...tableCatalog, {}]);
          }}
        >
          Add sheet
        </StyledFooterButton>
      </>
    </div>
  );
};

const hostField = ({
  required,
  changeMethods,
  getValidation,
  validationErrors,
  db,
}: FieldPropTypes) => (
  <ValidatedInput
    id="host"
    name="host"
    value={db?.parameters?.host}
    required={required}
    hasTooltip
    tooltipText={t(
      'This can be either an IP address (e.g. 127.0.0.1) or a domain name (e.g. mydatabase.com).',
    )}
    validationMethods={{ onBlur: getValidation }}
    errorMessage={validationErrors?.host}
    placeholder="e.g. 127.0.0.1"
    className="form-group-w-50"
    label="Host"
    onChange={changeMethods.onParametersChange}
  />
);
const portField = ({
  required,
  changeMethods,
  getValidation,
  validationErrors,
  db,
}: FieldPropTypes) => (
  <>
    <ValidatedInput
      id="port"
      name="port"
      type="number"
      required={required}
      value={db?.parameters?.port as number}
      validationMethods={{ onBlur: getValidation }}
      errorMessage={validationErrors?.port}
      placeholder="e.g. 5432"
      className="form-group-w-50"
      label="Port"
      onChange={changeMethods.onParametersChange}
    />
  </>
);
const databaseField = ({
  required,
  changeMethods,
  getValidation,
  validationErrors,
  db,
}: FieldPropTypes) => (
  <ValidatedInput
    id="database"
    name="database"
    required={required}
    value={db?.parameters?.database}
    validationMethods={{ onBlur: getValidation }}
    errorMessage={validationErrors?.database}
    placeholder="e.g. world_population"
    label="Database name"
    onChange={changeMethods.onParametersChange}
    helpText={t('Copy the name of the  database you are trying to connect to.')}
  />
);
const usernameField = ({
  required,
  changeMethods,
  getValidation,
  validationErrors,
  db,
}: FieldPropTypes) => (
  <ValidatedInput
    id="username"
    name="username"
    required={required}
    value={db?.parameters?.username}
    validationMethods={{ onBlur: getValidation }}
    errorMessage={validationErrors?.username}
    placeholder="e.g. Analytics"
    label="Username"
    onChange={changeMethods.onParametersChange}
  />
);
const passwordField = ({
  required,
  changeMethods,
  getValidation,
  validationErrors,
  db,
  isEditMode,
}: FieldPropTypes) => (
  <ValidatedInput
    id="password"
    name="password"
    required={required}
    type={isEditMode && 'password'}
    value={db?.parameters?.password}
    validationMethods={{ onBlur: getValidation }}
    errorMessage={validationErrors?.password}
    placeholder="e.g. ********"
    label="Password"
    onChange={changeMethods.onParametersChange}
  />
);
const DisplayField = ({
  changeMethods,
  getValidation,
  validationErrors,
  db,
  setPublic,
}: FieldPropTypes) => {
  const setBooleanToString = (value: string): boolean => {
    if (value === 'true') {
      return true;
    }
    return false;
  };
  return (
    <>
      <ValidatedInput
        id="database_name"
        name="database_name"
        required
        value={db?.database_name}
        validationMethods={{ onBlur: getValidation }}
        errorMessage={validationErrors?.database_name}
        placeholder=""
        label="Display Name"
        onChange={changeMethods.onChange}
        helpText={t(
          'Pick a nickname for this database to display as in Superset.',
        )}
      />

      {db?.engine === 'gsheets' && (
        <>
          <FormLabel required>{t('Type of Google Sheets Allowed')}</FormLabel>
          <Select
            style={{ width: '100%' }}
            onChange={(value: string) => setPublic(setBooleanToString(value))}
            defaultValue="true"
          >
            <Select.Option value="true" key={1}>
              Publicly shared sheets only
            </Select.Option>
            <Select.Option value="false" key={2}>
              Public and privately shared sheets
            </Select.Option>
          </Select>
        </>
      )}
    </>
  );
};

const queryField = ({
  required,
  changeMethods,
  getValidation,
  validationErrors,
  db,
}: FieldPropTypes) => (
  <ValidatedInput
    id="query"
    name="query"
    required={required}
    value={db?.parameters?.query}
    validationMethods={{ onBlur: getValidation }}
    errorMessage={validationErrors?.query}
    placeholder="e.g. param1=value1&param2=value2"
    label="Additional Parameters"
    onChange={changeMethods.onParametersChange}
    helpText={t('Add additional custom parameters')}
  />
);

const forceSSLField = ({
  isEditMode,
  changeMethods,
  db,
  sslForced,
}: FieldPropTypes) => (
  <div css={(theme: SupersetTheme) => infoTooltip(theme)}>
    <Switch
      disabled={sslForced && !isEditMode}
      checked={db?.parameters?.encryption || sslForced}
      onChange={changed => {
        changeMethods.onParametersChange({
          target: {
            type: 'toggle',
            name: 'encryption',
            checked: true,
            value: changed,
          },
        });
      }}
    />
    <span css={toggleStyle}>SSL</span>
    <InfoTooltip
      tooltip={t('SSL Mode "require" will be used.')}
      placement="right"
      viewBox="0 0 24 24"
    />
  </div>
);

const FORM_FIELD_MAP = {
  host: hostField,
  port: portField,
  database: databaseField,
  username: usernameField,
  password: passwordField,
  database_name: DisplayField,
  query: queryField,
  encryption: forceSSLField,
  credentials_info: CredentialsInfo,
  table_catalog: TableCatalog,
};

const DatabaseConnectionForm = ({
  dbModel: { parameters },
  onParametersChange,
  onChange,
  onParametersUploadFileChange,
  validationErrors,
  getValidation,
  db,
  isEditMode = false,
  sslForced,
  editNewDb,
  setPublic,
  isPublic,
}: {
  isEditMode?: boolean;
  sslForced: boolean;
  editNewDb?: boolean;
  isPublic?: boolean;
  setPublic: Dispatch<SetStateAction<boolean>>;
  dbModel: DatabaseForm;
  db: Partial<DatabaseObject> | null;
  onParametersChange: (
    event: FormEvent<InputProps> | { target: HTMLInputElement },
  ) => void;
  onChange: (
    event: FormEvent<InputProps> | { target: HTMLInputElement },
  ) => void;
  onParametersUploadFileChange?: (
    event: FormEvent<InputProps> | { target: HTMLInputElement },
  ) => void;
  validationErrors: JsonObject | null;
  getValidation: () => void;
}) => (
  <>
    <div
      // @ts-ignore
      css={(theme: SupersetTheme) => [
        formScrollableStyles,
        validatedFormStyles(theme),
      ]}
    >
      {parameters &&
        FormFieldOrder.filter(
          (key: string) =>
            Object.keys(parameters.properties).includes(key) ||
            key === 'database_name',
        ).map(field =>
          FORM_FIELD_MAP[field]({
            required: parameters.required?.includes(field),
            changeMethods: {
              onParametersChange,
              onChange,
              onParametersUploadFileChange,
            },
            validationErrors,
            getValidation,
            db,
            key: field,
            isEditMode,
            sslForced,
            editNewDb,
            setPublic,
            isPublic,
          }),
        )}
    </div>
  </>
);
export const FormFieldMap = FORM_FIELD_MAP;

export default DatabaseConnectionForm;
